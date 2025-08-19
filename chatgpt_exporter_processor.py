#!/usr/bin/env python3
"""
ChatGPT Exporter Dynamic UI Data Processing Script
Enhanced Python backend for LML integration and data transformation

This script provides comprehensive data processing capabilities for the ChatGPT Exporter
dynamic UI framework, including conversation analysis, format conversion, and API integration.
"""

import json
import csv
import xml.etree.ElementTree as ET
import xml.dom.minidom
import re
import argparse
import logging
import asyncio
import aiohttp
import aiofiles
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import base64
from urllib.parse import urlparse
import markdown
import html2text
import requests
from jinja2 import Template, Environment, FileSystemLoader

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('chatgpt_exporter.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class ConversationMessage:
    """Represents a single message in a conversation"""
    role: str
    content: str
    timestamp: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None
    message_id: Optional[str] = None

@dataclass
class Conversation:
    """Represents a complete conversation"""
    id: str
    title: str
    messages: List[ConversationMessage]
    model: str
    created_at: datetime
    updated_at: datetime
    metadata: Optional[Dict[str, Any]] = None

@dataclass
class ExportOptions:
    """Configuration for export operations"""
    format: str
    include_timestamps: bool = True
    include_metadata: bool = True
    custom_template: Optional[str] = None
    post_processing: List[str] = None
    output_path: Optional[str] = None

class DataProcessor:
    """Main data processing engine for ChatGPT conversations"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.supported_formats = ['json', 'csv', 'xml', 'markdown', 'html', 'txt']
        self.api_clients = {}
        self.template_env = Environment(loader=FileSystemLoader('templates'))
        
    async def load_conversation_from_json(self, file_path: str) -> Conversation:
        """Load conversation data from JSON file"""
        try:
            async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
                data = json.loads(await f.read())
                
            return self._parse_conversation_data(data)
        except Exception as e:
            logger.error(f"Error loading conversation from {file_path}: {e}")
            raise

    def _parse_conversation_data(self, data: Dict[str, Any]) -> Conversation:
        """Parse raw conversation data into structured format"""
        if isinstance(data, list):
            # Handle array of conversations (take first one)
            data = data[0] if data else {}
            
        conversation_id = data.get('id', '')
        title = data.get('title', 'Untitled Conversation')
        
        # Parse messages from mapping structure
        messages = []
        mapping = data.get('mapping', {})
        
        for node_id, node in mapping.items():
            message_data = node.get('message')
            if not message_data or not message_data.get('content'):
                continue
                
            # Extract message content
            content_parts = message_data.get('content', {}).get('parts', [])
            if not content_parts:
                continue
                
            content = '\n'.join(str(part) for part in content_parts if part)
            
            # Create message object
            message = ConversationMessage(
                role=message_data.get('author', {}).get('role', 'unknown'),
                content=content,
                timestamp=datetime.fromtimestamp(
                    message_data.get('create_time', 0), 
                    tz=timezone.utc
                ) if message_data.get('create_time') else None,
                metadata=message_data.get('metadata'),
                message_id=node_id
            )
            messages.append(message)
        
        # Sort messages by timestamp
        messages.sort(key=lambda m: m.timestamp or datetime.min.replace(tzinfo=timezone.utc))
        
        return Conversation(
            id=conversation_id,
            title=title,
            messages=messages,
            model=data.get('model', 'unknown'),
            created_at=datetime.fromtimestamp(
                data.get('create_time', 0), 
                tz=timezone.utc
            ) if data.get('create_time') else datetime.now(timezone.utc),
            updated_at=datetime.fromtimestamp(
                data.get('update_time', 0), 
                tz=timezone.utc
            ) if data.get('update_time') else datetime.now(timezone.utc),
            metadata=data.get('metadata')
        )

    async def export_conversation(
        self, 
        conversation: Conversation, 
        options: ExportOptions
    ) -> str:
        """Export conversation to specified format"""
        logger.info(f"Exporting conversation '{conversation.title}' to {options.format}")
        
        if options.format not in self.supported_formats:
            raise ValueError(f"Unsupported format: {options.format}")
            
        export_method = getattr(self, f'_export_to_{options.format}')
        result = await export_method(conversation, options)
        
        # Apply post-processing if specified
        if options.post_processing:
            result = await self._apply_post_processing(result, options.post_processing)
            
        # Save to file if output path specified
        if options.output_path:
            await self._save_to_file(result, options.output_path)
            
        return result

    async def _export_to_json(self, conversation: Conversation, options: ExportOptions) -> str:
        """Export conversation to JSON format"""
        data = {
            'id': conversation.id,
            'title': conversation.title,
            'model': conversation.model,
            'created_at': conversation.created_at.isoformat(),
            'updated_at': conversation.updated_at.isoformat(),
            'messages': []
        }
        
        if options.include_metadata and conversation.metadata:
            data['metadata'] = conversation.metadata
            
        for message in conversation.messages:
            message_data = {
                'role': message.role,
                'content': message.content
            }
            
            if options.include_timestamps and message.timestamp:
                message_data['timestamp'] = message.timestamp.isoformat()
                
            if options.include_metadata and message.metadata:
                message_data['metadata'] = message.metadata
                
            if message.message_id:
                message_data['id'] = message.message_id
                
            data['messages'].append(message_data)
            
        return json.dumps(data, indent=2, ensure_ascii=False)

    async def _export_to_csv(self, conversation: Conversation, options: ExportOptions) -> str:
        """Export conversation to CSV format"""
        import io
        output = io.StringIO()
        
        fieldnames = ['role', 'content']
        if options.include_timestamps:
            fieldnames.append('timestamp')
        if options.include_metadata:
            fieldnames.append('metadata')
            
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        
        for message in conversation.messages:
            row = {
                'role': message.role,
                'content': message.content.replace('\n', '\\n')  # Escape newlines
            }
            
            if options.include_timestamps:
                row['timestamp'] = message.timestamp.isoformat() if message.timestamp else ''
                
            if options.include_metadata:
                row['metadata'] = json.dumps(message.metadata) if message.metadata else ''
                
            writer.writerow(row)
            
        return output.getvalue()

    async def _export_to_xml(self, conversation: Conversation, options: ExportOptions) -> str:
        """Export conversation to XML format"""
        root = ET.Element('conversation')
        root.set('id', conversation.id)
        root.set('title', conversation.title)
        root.set('model', conversation.model)
        root.set('created_at', conversation.created_at.isoformat())
        root.set('updated_at', conversation.updated_at.isoformat())
        
        if options.include_metadata and conversation.metadata:
            metadata_elem = ET.SubElement(root, 'metadata')
            metadata_elem.text = json.dumps(conversation.metadata)
            
        messages_elem = ET.SubElement(root, 'messages')
        
        for message in conversation.messages:
            message_elem = ET.SubElement(messages_elem, 'message')
            message_elem.set('role', message.role)
            
            if message.message_id:
                message_elem.set('id', message.message_id)
                
            if options.include_timestamps and message.timestamp:
                message_elem.set('timestamp', message.timestamp.isoformat())
                
            content_elem = ET.SubElement(message_elem, 'content')
            content_elem.text = message.content
            
            if options.include_metadata and message.metadata:
                msg_metadata_elem = ET.SubElement(message_elem, 'metadata')
                msg_metadata_elem.text = json.dumps(message.metadata)
                
        # Pretty print XML
        rough_string = ET.tostring(root, encoding='unicode')
        reparsed = xml.dom.minidom.parseString(rough_string)
        return reparsed.toprettyxml(indent='  ')

    async def _export_to_markdown(self, conversation: Conversation, options: ExportOptions) -> str:
        """Export conversation to Markdown format"""
        lines = []
        
        # Add frontmatter
        lines.append('---')
        lines.append(f'title: {conversation.title}')
        lines.append(f'model: {conversation.model}')
        lines.append(f'created: {conversation.created_at.isoformat()}')
        lines.append(f'updated: {conversation.updated_at.isoformat()}')
        if options.include_metadata and conversation.metadata:
            lines.append(f'metadata: {json.dumps(conversation.metadata)}')
        lines.append('---')
        lines.append('')
        
        # Add title
        lines.append(f'# {conversation.title}')
        lines.append('')
        
        # Add messages
        for message in conversation.messages:
            # Add message header
            author = self._format_author(message.role)
            lines.append(f'## {author}')
            
            if options.include_timestamps and message.timestamp:
                lines.append(f'*{message.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC")}*')
                lines.append('')
                
            # Add message content
            lines.append(message.content)
            lines.append('')
            
        return '\n'.join(lines)

    async def _export_to_html(self, conversation: Conversation, options: ExportOptions) -> str:
        """Export conversation to HTML format"""
        if options.custom_template:
            template = self.template_env.get_template(options.custom_template)
        else:
            template = self._get_default_html_template()
            
        return template.render(
            conversation=conversation,
            options=options,
            format_author=self._format_author,
            datetime=datetime
        )

    async def _export_to_txt(self, conversation: Conversation, options: ExportOptions) -> str:
        """Export conversation to plain text format"""
        lines = []
        
        # Add header
        lines.append(f"Conversation: {conversation.title}")
        lines.append(f"Model: {conversation.model}")
        lines.append(f"Created: {conversation.created_at.isoformat()}")
        lines.append(f"Updated: {conversation.updated_at.isoformat()}")
        lines.append('=' * 80)
        lines.append('')
        
        # Add messages
        for message in conversation.messages:
            author = self._format_author(message.role)
            
            if options.include_timestamps and message.timestamp:
                lines.append(f"{author} ({message.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}):")
            else:
                lines.append(f"{author}:")
                
            lines.append(message.content)
            lines.append('-' * 40)
            lines.append('')
            
        return '\n'.join(lines)

    def _format_author(self, role: str) -> str:
        """Format author role for display"""
        role_mapping = {
            'user': 'You',
            'assistant': 'ChatGPT',
            'system': 'System',
            'tool': 'Tool'
        }
        return role_mapping.get(role, role.title())

    def _get_default_html_template(self) -> Template:
        """Get default HTML template"""
        template_str = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ conversation.title }}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .conversation {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        .metadata {
            background: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-size: 0.9em;
        }
        .message {
            margin-bottom: 25px;
            padding: 15px;
            border-radius: 8px;
        }
        .message.user {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
        }
        .message.assistant {
            background: #f1f8e9;
            border-left: 4px solid #4caf50;
        }
        .message-header {
            font-weight: bold;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .timestamp {
            font-size: 0.8em;
            color: #666;
            font-weight: normal;
        }
        .content {
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        pre {
            background: #f4f4f4;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
        }
        code {
            background: #f4f4f4;
            padding: 2px 4px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="conversation">
        <h1>{{ conversation.title }}</h1>
        
        <div class="metadata">
            <strong>Model:</strong> {{ conversation.model }}<br>
            <strong>Created:</strong> {{ conversation.created_at.strftime('%Y-%m-%d %H:%M:%S UTC') }}<br>
            <strong>Updated:</strong> {{ conversation.updated_at.strftime('%Y-%m-%d %H:%M:%S UTC') }}
        </div>
        
        {% for message in conversation.messages %}
        <div class="message {{ message.role }}">
            <div class="message-header">
                <span>{{ format_author(message.role) }}</span>
                {% if options.include_timestamps and message.timestamp %}
                <span class="timestamp">{{ message.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC') }}</span>
                {% endif %}
            </div>
            <div class="content">{{ message.content }}</div>
        </div>
        {% endfor %}
    </div>
</body>
</html>
        """
        return Template(template_str)

    async def _apply_post_processing(self, content: str, processors: List[str]) -> str:
        """Apply post-processing to exported content"""
        for processor in processors:
            if processor == 'markdown_to_html':
                content = markdown.markdown(content)
            elif processor == 'html_to_text':
                h = html2text.HTML2Text()
                h.ignore_links = False
                content = h.handle(content)
            elif processor == 'sanitize_html':
                # Basic HTML sanitization (you might want to use a library like bleach)
                content = re.sub(r'<script.*?</script>', '', content, flags=re.DOTALL | re.IGNORECASE)
                content = re.sub(r'<style.*?</style>', '', content, flags=re.DOTALL | re.IGNORECASE)
            elif processor == 'remove_timestamps':
                # Remove timestamp patterns
                content = re.sub(r'\*\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC\*\n\n', '', content)
            else:
                logger.warning(f"Unknown post-processor: {processor}")
                
        return content

    async def _save_to_file(self, content: str, output_path: str):
        """Save content to file"""
        path = Path(output_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        
        async with aiofiles.open(path, 'w', encoding='utf-8') as f:
            await f.write(content)
            
        logger.info(f"Exported content saved to {output_path}")

    async def batch_export(
        self, 
        input_directory: str, 
        output_directory: str, 
        export_format: str,
        options: Optional[ExportOptions] = None
    ):
        """Batch export multiple conversations"""
        input_path = Path(input_directory)
        output_path = Path(output_directory)
        output_path.mkdir(parents=True, exist_ok=True)
        
        if not options:
            options = ExportOptions(format=export_format)
        else:
            options.format = export_format
            
        json_files = list(input_path.glob('*.json'))
        logger.info(f"Found {len(json_files)} JSON files to process")
        
        for json_file in json_files:
            try:
                conversation = await self.load_conversation_from_json(str(json_file))
                
                # Set output path
                output_file = output_path / f"{json_file.stem}.{export_format}"
                options.output_path = str(output_file)
                
                await self.export_conversation(conversation, options)
                logger.info(f"Processed {json_file.name}")
                
            except Exception as e:
                logger.error(f"Error processing {json_file.name}: {e}")

    async def analyze_conversation(self, conversation: Conversation) -> Dict[str, Any]:
        """Analyze conversation for insights"""
        analysis = {
            'total_messages': len(conversation.messages),
            'user_messages': len([m for m in conversation.messages if m.role == 'user']),
            'assistant_messages': len([m for m in conversation.messages if m.role == 'assistant']),
            'total_characters': sum(len(m.content) for m in conversation.messages),
            'total_words': sum(len(m.content.split()) for m in conversation.messages),
            'conversation_duration': None,
            'topics': [],
            'languages_detected': [],
            'sentiment_analysis': {}
        }
        
        # Calculate duration
        timestamps = [m.timestamp for m in conversation.messages if m.timestamp]
        if len(timestamps) >= 2:
            analysis['conversation_duration'] = (max(timestamps) - min(timestamps)).total_seconds()
            
        # Basic topic extraction (keywords)
        all_text = ' '.join(m.content for m in conversation.messages if m.role in ['user', 'assistant'])
        words = re.findall(r'\b\w+\b', all_text.lower())
        word_freq = {}
        for word in words:
            if len(word) > 4:  # Only consider longer words
                word_freq[word] = word_freq.get(word, 0) + 1
                
        # Get top topics
        analysis['topics'] = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return analysis

class APIIntegration:
    """Handle integration with various APIs"""
    
    def __init__(self, api_configs: Dict[str, Dict[str, Any]]):
        self.api_configs = api_configs
        self.session = aiohttp.ClientSession()
        
    async def __aenter__(self):
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.session.close()

    async def test_api_connection(self, api_name: str) -> Dict[str, Any]:
        """Test connection to an API"""
        if api_name not in self.api_configs:
            return {'status': 'error', 'message': f'API {api_name} not configured'}
            
        config = self.api_configs[api_name]
        
        try:
            async with self.session.get(
                config['health_endpoint'],
                headers=self._get_auth_headers(config),
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                if response.status == 200:
                    return {'status': 'connected', 'response_time': response.headers.get('x-response-time')}
                else:
                    return {'status': 'error', 'message': f'HTTP {response.status}'}
                    
        except asyncio.TimeoutError:
            return {'status': 'error', 'message': 'Connection timeout'}
        except Exception as e:
            return {'status': 'error', 'message': str(e)}

    def _get_auth_headers(self, config: Dict[str, Any]) -> Dict[str, str]:
        """Get authentication headers for API requests"""
        headers = {}
        
        if config['auth_type'] == 'bearer':
            headers['Authorization'] = f"Bearer {config['token']}"
        elif config['auth_type'] == 'api_key':
            headers['X-API-Key'] = config['api_key']
        elif config['auth_type'] == 'basic':
            credentials = base64.b64encode(f"{config['username']}:{config['password']}".encode()).decode()
            headers['Authorization'] = f"Basic {credentials}"
            
        return headers

    async def send_conversation_to_api(
        self, 
        api_name: str, 
        conversation: Conversation, 
        endpoint: str = 'chat'
    ) -> Dict[str, Any]:
        """Send conversation to external API for processing"""
        if api_name not in self.api_configs:
            raise ValueError(f"API {api_name} not configured")
            
        config = self.api_configs[api_name]
        url = f"{config['base_url']}/{endpoint}"
        
        # Prepare payload
        payload = {
            'conversation_id': conversation.id,
            'title': conversation.title,
            'messages': [
                {
                    'role': msg.role,
                    'content': msg.content,
                    'timestamp': msg.timestamp.isoformat() if msg.timestamp else None
                }
                for msg in conversation.messages
            ]
        }
        
        try:
            async with self.session.post(
                url,
                json=payload,
                headers=self._get_auth_headers(config),
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                result = await response.json()
                return {
                    'status': 'success' if response.status == 200 else 'error',
                    'data': result,
                    'response_code': response.status
                }
                
        except Exception as e:
            return {'status': 'error', 'message': str(e)}

async def main():
    """Main function for CLI usage"""
    parser = argparse.ArgumentParser(description='ChatGPT Exporter Data Processing')
    parser.add_argument('input', help='Input JSON file or directory')
    parser.add_argument('-f', '--format', default='markdown', 
                       choices=['json', 'csv', 'xml', 'markdown', 'html', 'txt'],
                       help='Output format')
    parser.add_argument('-o', '--output', help='Output file or directory')
    parser.add_argument('--no-timestamps', action='store_true', 
                       help='Exclude timestamps from output')
    parser.add_argument('--no-metadata', action='store_true', 
                       help='Exclude metadata from output')
    parser.add_argument('--template', help='Custom template file for HTML export')
    parser.add_argument('--post-processing', nargs='+', 
                       help='Post-processing steps to apply')
    parser.add_argument('--analyze', action='store_true', 
                       help='Perform conversation analysis')
    parser.add_argument('--batch', action='store_true', 
                       help='Batch process directory')
    parser.add_argument('--config', help='Configuration file for API integration')
    
    args = parser.parse_args()
    
    # Load configuration
    config = {}
    if args.config:
        with open(args.config, 'r') as f:
            config = json.load(f)
    
    processor = DataProcessor(config)
    
    # Prepare export options
    options = ExportOptions(
        format=args.format,
        include_timestamps=not args.no_timestamps,
        include_metadata=not args.no_metadata,
        custom_template=args.template,
        post_processing=args.post_processing or [],
        output_path=args.output
    )
    
    try:
        if args.batch:
            # Batch processing
            output_dir = args.output or f"./exported_{args.format}"
            await processor.batch_export(args.input, output_dir, args.format, options)
            
        else:
            # Single file processing
            conversation = await processor.load_conversation_from_json(args.input)
            
            if args.analyze:
                # Perform analysis
                analysis = await processor.analyze_conversation(conversation)
                print("Conversation Analysis:")
                print(json.dumps(analysis, indent=2, default=str))
                
            # Export conversation
            result = await processor.export_conversation(conversation, options)
            
            if not args.output:
                print(result)
                
    except Exception as e:
        logger.error(f"Processing failed: {e}")
        return 1
        
    return 0

if __name__ == '__main__':
    import sys
    sys.exit(asyncio.run(main()))