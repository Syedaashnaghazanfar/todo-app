# ChatKit Frontend API Reference - JavaScript/TypeScript

This document contains the official client-side API patterns for embedding ChatKit UI in web applications. **This is the single source of truth** for all ChatKit frontend integrations.

## Installation

ChatKit is typically loaded via CDN or bundled with your application.

### CDN (Recommended for Quick Start)

```html
<script src="https://cdn.openai.com/chatkit/v1/chatkit.js"></script>
```

### NPM (If Available)

```bash
npm install @openai/chatkit
# or
pnpm add @openai/chatkit
```

## Overview

ChatKit is a Web Component (`<chatkit-widget>`) that provides a complete chat interface. You configure it to connect to either:
1. **OpenAI-hosted backend** (Agent Builder workflows)
2. **Custom backend** (your own server implementing ChatKit protocol)

## Basic Usage

###Minimal Example

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.openai.com/chatkit/v1/chatkit.js"></script>
</head>
<body>
  <chatkit-widget
    api-url="https://your-backend.com/chatkit"
    theme="light"
  ></chatkit-widget>
</body>
</html>
```

### Programmatic Mounting

```javascript
import ChatKit from '@openai/chatkit';

const widget = document.createElement('chatkit-widget');
widget.setAttribute('api-url', 'https://your-backend.com/chatkit');
widget.setAttribute('theme', 'dark');
document.body.appendChild(widget);
```

## Configuration Options

### Required Options

| Option | Type | Description |
|--------|------|-------------|
| `apiURL` | `string` | Endpoint implementing ChatKit server protocol |

### Optional Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `fetch` | `typeof fetch` | `window.fetch` | Override fetch for custom headers/auth |
| `theme` | `"light" \| "dark"` | `"light"` | UI theme |
| `initialThread` | `string \| null` | `null` | Thread ID to open on mount; null shows new thread view |
| `clientTools` | `Record<string, Function>` | `{}` | Client-executed tools |
| `header` | `object \| boolean` | `true` | Header configuration or false to hide |
| `newThreadView` | `object` | - | Greeting text and starter prompts |
| `messages` | `object` | - | Message affordances (feedback, annotations) |
| `composer` | `object` | - | Attachments, entity tags, placeholder |
| `entities` | `object` | - | Entity lookup, click handling, previews |

## Connecting to Custom Backend

### Basic Configuration

```javascript
const widget = document.createElement('chatkit-widget');
widget.setAttribute('api-url', 'https://api.yourapp.com/chatkit');
document.body.appendChild(widget);
```

### With Custom Fetch (Authentication)

```javascript
widget.fetch = async (url, options) => {
  const token = await getAuthToken();
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
};
```

### Full Configuration Example

```typescript
interface ChatKitOptions {
  apiURL: string;
  fetch?: typeof fetch;
  theme?: 'light' | 'dark';
  initialThread?: string | null;
  clientTools?: Record<string, (args: any) => Promise<any>>;
  header?: {
    title?: string;
    subtitle?: string;
    logo?: string;
  } | false;
  newThreadView?: {
    greeting?: string;
    starters?: Array<{ text: string; prompt?: string }>;
  };
  messages?: {
    enableFeedback?: boolean;
    enableAnnotations?: boolean;
  };
  composer?: {
    placeholder?: string;
    enableAttachments?: boolean;
    entityTags?: boolean;
  };
  entities?: {
    lookup?: (query: string) => Promise<Entity[]>;
    onClick?: (entity: Entity) => void;
    preview?: (entity: Entity) => string | HTMLElement;
  };
}
```

## Connecting to OpenAI-Hosted Workflow

For Agent Builder workflows:

```javascript
widget.setAttribute('domain-key', 'YOUR_DOMAIN_KEY');
widget.setAttribute('client-token', await getClientToken());
```

**Note**: Hosted workflows use `domain-key` instead of `api-url`.

## Client Tools

Client tools execute in the browser and are registered on both client and server.

### 1. Register on Client

```javascript
const widget = document.createElement('chatkit-widget');
widget.clientTools = {
  add_to_todo_list: async (args) => {
    const { item } = args;
    // Execute in browser
    await addToLocalStorage(item);
    return { success: true, item };
  },

  open_calendar: async (args) => {
    const { date } = args;
    window.open(`https://calendar.app?date=${date}`, '_blank');
    return { opened: true };
  },
};
```

### 2. Register on Server

Server-side agent must also register the tool (see backend docs):

```python
@function_tool
async def add_to_todo_list(ctx, item: str) -> None:
    ctx.context.client_tool_call = ClientToolCall(
        name="add_to_todo_list",
        arguments={"item": item},
    )
```

### 3. Flow

1. User sends message
2. Server agent calls client tool
3. ChatKit receives `ClientToolCallEvent` from server
4. ChatKit executes registered client function
5. ChatKit sends output back to server
6. Server continues processing

## Events

ChatKit emits CustomEvents that you can listen to:

### Available Events

```typescript
type Events = {
  "chatkit.error": CustomEvent<{ error: Error }>;
  "chatkit.response.start": CustomEvent<void>;
  "chatkit.response.end": CustomEvent<void>;
  "chatkit.thread.change": CustomEvent<{ threadId: string | null }>;
  "chatkit.log": CustomEvent<{ name: string; data?: Record<string, unknown> }>;
};
```

### Listening to Events

```javascript
const widget = document.querySelector('chatkit-widget');

widget.addEventListener('chatkit.error', (event) => {
  console.error('ChatKit error:', event.detail.error);
});

widget.addEventListener('chatkit.response.start', () => {
  console.log('Agent started responding');
});

widget.addEventListener('chatkit.response.end', () => {
  console.log('Agent finished responding');
});

widget.addEventListener('chatkit.thread.change', (event) => {
  const { threadId } = event.detail;
  console.log('Thread changed to:', threadId);
  // Save to localStorage, update URL, etc.
});

widget.addEventListener('chatkit.log', (event) => {
  console.log('ChatKit log:', event.detail.name, event.detail.data);
});
```

## Theming

### Built-in Themes

```javascript
widget.setAttribute('theme', 'light');  // or 'dark'
```

### Custom Styling

ChatKit exposes CSS custom properties for theming:

```css
chatkit-widget {
  --chatkit-primary-color: #007bff;
  --chatkit-background-color: #ffffff;
  --chatkit-text-color: #333333;
  --chatkit-border-radius: 8px;
  --chatkit-font-family: 'Inter', sans-serif;
}
```

### OpenAI Sans Font

Download [OpenAI Sans Variable](https://drive.google.com/file/d/10-dMu1Oknxg3cNPHZOda9a1nEkSwSXE1/view?usp=sharing) for the official ChatKit look:

```css
@font-face {
  font-family: 'OpenAI Sans';
  src: url('/fonts/OpenAISans-Variable.woff2') format('woff2-variations');
}

chatkit-widget {
  --chatkit-font-family: 'OpenAI Sans', sans-serif;
}
```

## Header Configuration

### Default Header

```javascript
// Header shown by default with app name
widget.header = {
  title: 'Support Assistant',
  subtitle: 'Powered by OpenAI',
  logo: '/logo.png',
};
```

### Hide Header

```javascript
widget.header = false;
```

## New Thread View

Customize the greeting and starter prompts:

```javascript
widget.newThreadView = {
  greeting: 'Hello! How can I help you today?',
  starters: [
    { text: 'Get started', prompt: 'Tell me about your features' },
    { text: 'Pricing info', prompt: 'What are your pricing plans?' },
    { text: 'Contact support', prompt: 'I need help with my account' },
  ],
};
```

## Message Configuration

### Enable Feedback

```javascript
widget.messages = {
  enableFeedback: true,  // Shows thumbs up/down on messages
  enableAnnotations: true,  // Allows highlighting and commenting
};
```

## Composer Configuration

### Placeholder Text

```javascript
widget.composer = {
  placeholder: 'Ask me anything...',
};
```

### Enable/Disable Attachments

```javascript
widget.composer = {
  enableAttachments: true,  // Allow file uploads
};
```

### Entity Tags

```javascript
widget.composer = {
  entityTags: true,  // Enable @mentions and #tags
};
```

## Entities

Configure entity lookup and handling:

```javascript
widget.entities = {
  lookup: async (query) => {
    // Search for entities matching query
    const results = await fetch(`/api/search?q=${query}`);
    return results.json();
  },

  onClick: (entity) => {
    // Handle entity click
    window.location.href = `/entity/${entity.id}`;
  },

  preview: (entity) => {
    // Return HTML for entity preview
    return `<div class="entity-preview">${entity.name}</div>`;
  },
};
```

### Entity Type

```typescript
interface Entity {
  id: string;
  type: string;
  name: string;
  metadata?: Record<string, any>;
}
```

## Framework Integration

### React

```tsx
import { useEffect, useRef } from 'react';

function ChatWidget() {
  const widgetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget) return;

    widget.setAttribute('api-url', process.env.NEXT_PUBLIC_API_URL);
    widget.setAttribute('theme', 'light');

    // Configure
    (widget as any).fetch = async (url: string, options: RequestInit) => {
      const token = await getAuthToken();
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        },
      });
    };

    // Listen to events
    widget.addEventListener('chatkit.error', (e: any) => {
      console.error(e.detail.error);
    });
  }, []);

  return <chatkit-widget ref={widgetRef} />;
}
```

### Next.js (App Router)

```tsx
'use client';

import { useEffect } from 'react';

export default function ChatPage() {
  useEffect(() => {
    // Load ChatKit script
    const script = document.createElement('script');
    script.src = 'https://cdn.openai.com/chatkit/v1/chatkit.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <chatkit-widget api-url={process.env.NEXT_PUBLIC_API_URL} />;
}
```

### Vue

```vue
<template>
  <chatkit-widget :api-url="apiUrl" theme="light" ref="widget" />
</template>

<script setup>
import { ref, onMounted } from 'vue';

const widget = ref(null);
const apiUrl = import.meta.env.VITE_API_URL;

onMounted(() => {
  widget.value.fetch = async (url, options) => {
    const token = await getAuthToken();
    return fetch(url, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
  };
});
</script>
```

## Debugging

### Enable Debug Logging

Listen to log events:

```javascript
widget.addEventListener('chatkit.log', (event) => {
  console.log('[ChatKit]', event.detail.name, event.detail.data);
});
```

### Common Issues

**Widget Not Appearing:**
- Check script loaded: `console.log(window.ChatKit)`
- Verify element exists: `document.querySelector('chatkit-widget')`
- Check console for errors

**Not Connecting to Backend:**
- Verify `api-url` is correct
- Check CORS headers on backend
- Inspect network tab for failed requests
- Verify authentication headers

**Messages Not Sending:**
- Check backend is running and responding
- Verify fetch override is correct
- Look for CORS errors
- Check request/response in network tab

**File Uploads Failing:**
- Verify backend supports uploads
- Check file size limits
- Confirm upload strategy matches backend
- Review upload permissions

## Security Best Practices

1. **Use HTTPS**: Always in production
2. **Validate auth tokens**: Check tokens on every request via custom fetch
3. **Sanitize user input**: On backend, not just frontend
4. **CORS configuration**: Whitelist specific domains
5. **Content Security Policy**: Restrict script sources
6. **Rate limiting**: Implement on backend
7. **Session management**: Use secure, HTTP-only cookies

## Performance Optimization

1. **Lazy load**: Load ChatKit script only when needed
2. **Preconnect**: Add `<link rel="preconnect">` for API domain
3. **Cache responses**: Implement caching on backend
4. **Minimize reflows**: Avoid layout changes while streaming
5. **Virtual scrolling**: For very long conversations (built-in)

## Accessibility

ChatKit includes built-in accessibility features:
- Keyboard navigation
- Screen reader support
- ARIA labels
- Focus management
- High contrast mode support

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 14+, Chrome Android Latest

## Version Information

This documentation reflects the ChatKit frontend Web Component as of November 2024. For the latest updates, visit: https://github.com/openai/chatkit-python
