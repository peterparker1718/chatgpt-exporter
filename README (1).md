# README

## ChatGPT Exporter

### A GreasyFork script to export the chat history of [ChatGPT](https://chatgpt.com/)

[![license](https://img.shields.io/github/license/pionxzh/chatgpt-exporter?color=red)](https://github.com/pionxzh/chatgpt-exporter/blob/master/LICENSE) [![release](https://img.shields.io/github/v/release/pionxzh/chatgpt-exporter?color=blue)](https://github.com/pionxzh/chatgpt-exporter/releases/latest) [![GreasyFork](https://img.shields.io/static/v1?label=%20\&message=GreasyFork\&style=flat-square\&labelColor=7B0000\&color=960000\&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3ggEBCQHM3fXsAAAAVdJREFUOMudkz2qwkAUhc/goBaGJBgUtBCZyj0ILkpwAW7Bws4yO3AHLiCtEFD8KVREkoiFxZzX5A2KGfN4F04zMN+ce+5c4LMUgDmANYBnrnV+plBSi+FwyHq9TgA2LQpvCiEiABwMBtzv95RSfoNEHy8DYBzHrNVqVEr9BWKcqNFoxF6vx3a7zc1mYyC73a4MogBg7vs+z+czO50OW60Wt9stK5UKp9Mpj8cjq9WqDTBHnjAdxzGQZrPJw+HA31oulzbAWgLoA0CWZVBKIY5jzGYzdLtdE9DlcrFNrY98zobqOA6TJKHW2jg4nU5sNBpFDp6mhVe5rsvVasUwDHm9Xqm15u12o+/7Hy0gD8KatOd5vN/v1FozTVN6nkchxFuI6hsAAIMg4OPxMJCXdtTbR7JJCMEgCJhlGUlyPB4XfumozInrupxMJpRSRtZlKoNYl+m/6/wDuWAjtPfsQuwAAAAASUVORK5CYII=)](https://greasyfork.org/scripts/456055-chatgpt-exporter)

English   |   [Indonesia](README\_ID.md)   |   [한국어](README\_KR.md)   |   [Türkçe](README\_TR.md)

![image](https://github.com/pionxzh/chatgpt-exporter/assets/9910706/1c864670-7912-4484-b4be-bdf5dde51557)

### Install

#### Prerequisites

Install `Tampermonkey`

[![Chrome](https://user-images.githubusercontent.com/3750161/214147732-c75e96a4-48a4-4b64-b407-c2402e899a75.PNG)](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)    [![Firefox](https://user-images.githubusercontent.com/3750161/214148610-acdef778-753e-470e-8765-6cc97bca85ed.png)](https://addons.mozilla.org/firefox/addon/tampermonkey)    [![Chrome](https://user-images.githubusercontent.com/3750161/233201810-d1026855-0482-44c8-b1ec-c7247134473e.png)](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

#### UserScript

| Greasyfork                                                                                                       | GitHub                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| [![Install](https://img.shields.io/badge/-Install-blue)](https://greasyfork.org/scripts/456055-chatgpt-exporter) | [![Install](https://img.shields.io/badge/-Install-blue)](https://raw.githubusercontent.com/pionxzh/chatgpt-exporter/master/dist/chatgpt.user.js) |

##

[📚 Supported Formats](<README (1).md#-supported-formats>)   |   [💡 Example](<README (1).md#-example>)   |   [🤝 Contribution](<README (1).md#-contribution>)   |   [⭐ Star History](<README (1).md#-star-history>)

##

### 📚 Supported Formats

* [Text](<README (1).md#text>)
* [HTML](<README (1).md#html>)
* [Markdown](<README (1).md#markdown>)
* [PNG](<README (1).md#screenshot>)
* [JSON](<README (1).md#json>)

### 💡 Example

#### Text

```
You:
I'm creating a ChatGPT Exporter. What do you think?

ChatGPT:
It sounds like you're planning on creating a tool that uses the ChatGPT model
to export text. ChatGPT is a large language model trained by OpenAI that is
designed to generate human-like text responses based on a given input. It can
be used for a variety of applications, such as chatbots, automated responses
to customer inquiries, and more.

However, please keep in mind that as a large language model, ChatGPT has not
been specifically trained for any specific task, so the quality of the
generated text will depend on how it is used and the context in which it is
applied. It's important to use ChatGPT responsibly and consider the potential
consequences of using it in any given situation.
```

#### HTML

<div align="center">

<img src="https://github.com/pionxzh/chatgpt-exporter/assets/9910706/47481c7a-4a6a-433b-b08e-fdf3bbabcb64" alt="image" width="643">

</div>

#### Markdown

```
---
title: ChatGPT Exporter Creation
source: https://chat.openai.com/c/cf3f8850-1d69-43c8-b99b-affd0de4e76f
author: ChatGPT
---

# ChatGPT Exporter Creation

#### You:
I'm creating a ChatGPT Exporter. What do you think?

#### ChatGPT:
It sounds like you're planning on creating a tool that uses the ChatGPT model to export text. ChatGPT is a large language model trained by OpenAI that is designed to generate human-like text responses based on a given input. It can be used for a variety of applications, such as chatbots, automated responses to customer inquiries, and more.
```

#### Screenshot

<div align="center">

<img src="https://user-images.githubusercontent.com/9910706/205663680-6ac97fac-39b0-495c-bee4-8ef37713a9ae.png" alt="" width="480">

</div>

#### JSON

the raw content from API `https://chat.openai.com/backend-api/conversation/[id]`

<details>

<summary>Click to see</summary>

```json
{
    "id": "35a1fa05-e928-4c39-8ffa-ca74f75b509f",
    "title": "AI Turing Test.",
    "create_time": 1678015311.655875,
    "mapping": {
        "5c48fa3e-e4ee-4d00-aa66-8fbcb671a358": {
            "id": "5c48fa3e-e4ee-4d00-aa66-8fbcb671a358",
            "message": {
                "id": "5c48fa3e-e4ee-4d00-aa66-8fbcb671a358",
                "author": {
                    "role": "system",
                    "metadata": {}
                },
                "create_time": 1678015311.655875,
                "content": {
                    "content_type": "text",
                    "parts": [
                        ""
                    ]
                },
                "end_turn": true,
                "weight": 1,
                "metadata": {},
                "recipient": "all"
            },
            "parent": "9310b90f-d8f0-4be6-bac2-daacddac784f",
            "children": [
                "4afb9720-3a88-49b1-9309-e2b53d607f34"
            ]
        },
        "9310b90f-d8f0-4be6-bac2-daacddac784f": {
            "id": "9310b90f-d8f0-4be6-bac2-daacddac784f",
            "children": [
                "5c48fa3e-e4ee-4d00-aa66-8fbcb671a358"
            ]
        },
        "4afb9720-3a88-49b1-9309-e2b53d607f34": {
            "id": "4afb9720-3a88-49b1-9309-e2b53d607f34",
            "message": {
                "id": "4afb9720-3a88-49b1-9309-e2b53d607f34",
                "author": {
                    "role": "user",
                    "metadata": {}
                },
                "create_time": 1678015311.656259,
                "content": {
                    "content_type": "text",
                    "parts": [
                        "write an poem about the Turing test"
                    ]
                },
                "weight": 1,
                "metadata": {
                    "timestamp_": "absolute"
                },
                "recipient": "all"
            },
            "parent": "5c48fa3e-e4ee-4d00-aa66-8fbcb671a358",
            "children": [
                "7027f1a5-8bd5-4463-9869-8a1d1db2f9a1"
            ]
        },
        "7027f1a5-8bd5-4463-9869-8a1d1db2f9a1": {
            "id": "7027f1a5-8bd5-4463-9869-8a1d1db2f9a1",
            "message": {
                "id": "7027f1a5-8bd5-4463-9869-8a1d1db2f9a1",
                "author": {
                    "role": "assistant",
                    "metadata": {}
                },
                "create_time": 1678185638.890551,
                "content": {
                    "content_type": "text",
                    "parts": [
                        "In the realm of machines and code,\nThere lies a test, with rules bestowed,\nA challenge to determine true mind,\nAnd if a machine's intelligence can find.\n\nThe Turing test, named for its creator,\nSeeks to find if a machine's behavior\nCan mimic that of a human so well,\nThat it's indistinguishable, can you tell?\n\nThrough conversations, the test is done,\nWith a judge and a machine, the game is run,\nIf the judge can't tell who is who,\nThen the machine's intelligence shines through.\n\nBut can a machine truly think?\nOr is it just a clever bit of link,\nBetween algorithms and programming code,\nCan it truly understand and decode?\n\nThe Turing test, a thought experiment,\nBrings up questions, doubts, and sentiment,\nFor as we strive to create machines smart,\nWe wonder, will they ever truly have heart?\n\nSo let us ponder and explore,\nAs we create machines more and more,\nThe Turing test a reminder to be,\nMindful of what our machines can truly see."
                    ]
                },
                "end_turn": false,
                "weight": 1,
                "metadata": {
                    "model_slug": "text-davinci-002-render-sha",
                    "finish_details": {
                        "type": "stop"
                    },
                    "timestamp_": "absolute"
                },
                "recipient": "all"
            },
            "parent": "4afb9720-3a88-49b1-9309-e2b53d607f34",
            "children": []
        }
    },
    "moderation_results": [],
    "current_node": "7027f1a5-8bd5-4463-9869-8a1d1db2f9a1"
}
```

</details>

### 🤝 Contribution

See [CONTRIBUTING.md](CONTRIBUTING.md)

### ⭐ Star History

<div align="center">

<img src="https://api.star-history.com/svg?repos=pionxzh/chatgpt-exporter&#x26;type=Date" alt="Star History Chart" height="400" width="600">

</div>
