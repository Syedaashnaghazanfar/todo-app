# ChatKit Frontend - Change Log

This document tracks the ChatKit frontend Web Component version, patterns, and implementation approaches.

---

## Current Implementation (November 2024)

### Component Version
- **Component**: ChatKit Web Component (`<chatkit-widget>`)
- **CDN**: `https://cdn.openai.com/chatkit/v1/chatkit.js`
- **Documentation**: https://platform.openai.com/docs/guides/custom-chatkit
- **Browser Support**: Chrome, Firefox, Safari (latest 2 versions)

### Core Features in Use

#### 1. Web Component
- Custom element `<chatkit-widget>`
- Declarative configuration via attributes
- Programmatic API for dynamic setup
- Event-driven communication

#### 2. Backend Modes
- **Custom Backend**: `api-url` points to self-hosted server
- **Hosted Workflow**: `domain-key` for OpenAI Agent Builder

#### 3. Authentication
- Custom `fetch` override for auth headers
- Token injection via headers
- Session management support

#### 4. Client Tools
- Browser-executed functions
- Registered via `clientTools` property
- Coordinated with server-side tools
- Bi-directional communication

#### 5. Theming
- Light/dark mode support
- CSS custom properties for styling
- OpenAI Sans font support
- Custom header/composer configuration

### Key Implementation Patterns

#### 1. Basic Embedding (Custom Backend)

```typescript
const widget = document.createElement('chatkit-widget');
widget.setAttribute('api-url', 'https://api.yourapp.com/chatkit');
widget.setAttribute('theme', 'light');
document.body.appendChild(widget);
```

#### 2. Authentication

```typescript
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

#### 3. Client Tools

```typescript
widget.clientTools = {
  add_to_todo_list: async (args) => {
    await addToLocalStorage(args.item);
    return { success: true };
  },
};
```

#### 4. Event Listeners

```typescript
widget.addEventListener('chatkit.error', (e) => console.error(e.detail.error));
widget.addEventListener('chatkit.thread.change', (e) => saveThread(e.detail.threadId));
```

### Framework Integration Patterns

**React/Next.js:**
- Use `useEffect` to configure widget
- Load script dynamically or via `<Script>` component
- TypeScript types for better DX

**Vue:**
- Use `onMounted` for setup
- Ref for widget access
- Reactive properties

**Vanilla JS:**
- Direct DOM manipulation
- Script tag in HTML
- Simple attribute configuration

### Design Decisions

#### Why Web Component?
1. **Framework agnostic**: Works in any JavaScript environment
2. **Encapsulation**: Styles/behavior isolated from host app
3. **Easy integration**: Just add a script tag
4. **Native browser support**: No build step required
5. **Progressive enhancement**: Falls back gracefully

#### Why Custom Fetch?
1. **Authentication**: Inject tokens dynamically
2. **Flexibility**: Add custom headers, modify requests
3. **Tenant isolation**: Pass tenant context
4. **Debugging**: Log requests, modify responses
5. **Testing**: Mock backend responses easily

### Known Limitations

1. **No npm package yet**: CDN only (verify with OpenAI)
2. **Limited theming**: CSS custom properties only
3. **No SSR support**: Client-side only (Web Component)
4. **Browser compatibility**: Modern browsers only
5. **No offline mode**: Requires backend connection

### Security Best Practices

1. **HTTPS only**: Never use HTTP in production
2. **Token refresh**: Handle token expiration in custom fetch
3. **CORS configuration**: Whitelist specific domains on backend
4. **CSP headers**: Restrict script sources
5. **Sanitize inputs**: On backend, validate all inputs

### Version History

#### November 2024 - Initial Implementation
- Adopted ChatKit Web Component
- Configured custom backend mode
- Implemented auth via custom fetch
- Set up client tools
- Documented framework integrations

---

## Keeping This Current

When ChatKit frontend changes:
1. Update `chatkit-frontend/js/latest.md` with new API
2. Record changes here with date
3. Update templates to match new patterns
4. Test with new CDN version
5. Verify browser compatibility

**This changelog reflects actual implementation**, not theoretical features.
