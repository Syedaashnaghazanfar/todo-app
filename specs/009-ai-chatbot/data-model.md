# Data Model: AI Chatbot Phase 3

**Feature**: 009-ai-chatbot
**Date**: 2025-12-22

## 1. New Entities

### 1.1 Conversation

Represents a chat session between a user and the AI assistant.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | PK, auto-increment | Unique identifier |
| user_id | String(36) | FK users.id, NOT NULL, INDEX | Owner user ID |
| title | String(500) | NOT NULL | Auto-generated title |
| is_active | Boolean | DEFAULT true, INDEX | Whether conversation is active |
| created_at | DateTime | NOT NULL, DEFAULT now(), INDEX | Creation timestamp |
| updated_at | DateTime | NOT NULL, DEFAULT now(), INDEX | Last activity timestamp |

**Relationships**:
- `user` → User (many-to-one)
- `messages` → Message[] (one-to-many, cascade delete)

**Indexes**:
- `idx_conversations_user_id` on (user_id)
- `idx_conversations_user_active` on (user_id, is_active)
- `idx_conversations_updated_at` on (updated_at DESC)

### 1.2 Message

Individual messages within a conversation with 2-day retention.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | PK, auto-increment | Unique identifier |
| conversation_id | Integer | FK conversations.id, NOT NULL, INDEX | Parent conversation |
| user_id | String(36) | FK users.id, NOT NULL, INDEX | Owner user ID |
| role | String(20) | NOT NULL, CHECK | Message sender: user/assistant/system |
| content | Text | NOT NULL | Message text |
| tool_calls | JSON | NULLABLE | Tool invocation metadata |
| created_at | DateTime | NOT NULL, DEFAULT now(), INDEX | Message timestamp |
| expires_at | DateTime | NOT NULL, DEFAULT now()+2days, INDEX | Expiration timestamp |

**Constraints**:
- CHECK: `role IN ('user', 'assistant', 'system')`
- Default expires_at: `created_at + INTERVAL '2 days'`

**Relationships**:
- `conversation` → Conversation (many-to-one)
- `user` → User (many-to-one)

**Indexes**:
- `idx_messages_conversation_id` on (conversation_id)
- `idx_messages_user_id` on (user_id)
- `idx_messages_expires_at` on (expires_at)
- `idx_messages_conversation_created` on (conversation_id, created_at)

## 2. Existing Entities (Phase 2)

### 2.1 Task (Unchanged)

The chatbot interacts with existing Task model via MCP tools.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| title | String(255) | Task title |
| description | Text | Task description |
| is_completed | Boolean | Completion status |
| priority | String(20) | VERY_IMPORTANT/HIGH/MEDIUM/LOW |
| status | String(20) | NOT_STARTED/IN_PROGRESS/COMPLETED |
| user_id | String(36) | Owner user ID |
| tags | JSONB | Task tags array |
| due_date | DateTime | Due date |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Update timestamp |
| completed_at | DateTime | Completion timestamp |

### 2.2 User (Unchanged)

Referenced by conversations and messages.

| Field | Type | Description |
|-------|------|-------------|
| id | String(36) | Primary key (Better Auth) |
| email | String(255) | User email |
| password_hash | String(255) | Hashed password |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Update timestamp |

## 3. Entity Relationships Diagram

```
┌──────────────────┐
│      User        │
│  (Phase 2)       │
├──────────────────┤
│ id: String(36)   │───────────────────────────────────┐
│ email            │                                   │
│ password_hash    │                                   │
└────────┬─────────┘                                   │
         │                                             │
         │ 1:N                                         │ 1:N
         ▼                                             ▼
┌──────────────────┐                         ┌──────────────────┐
│  Conversation    │                         │      Task        │
│  (Phase 3 NEW)   │                         │   (Phase 2)      │
├──────────────────┤                         ├──────────────────┤
│ id: Integer      │                         │ id: UUID         │
│ user_id: FK      │──────────┐              │ user_id: FK      │
│ title            │          │              │ title            │
│ is_active        │          │              │ description      │
│ created_at       │          │              │ is_completed     │
│ updated_at       │          │              │ priority         │
└────────┬─────────┘          │              │ status           │
         │                    │              │ tags             │
         │ 1:N                │              │ due_date         │
         ▼                    │              └──────────────────┘
┌──────────────────┐          │
│    Message       │          │
│  (Phase 3 NEW)   │          │
├──────────────────┤          │
│ id: Integer      │          │
│ conversation_id  │──────────┘
│ user_id: FK      │
│ role             │
│ content          │
│ tool_calls       │
│ created_at       │
│ expires_at       │
└──────────────────┘
```

## 4. State Transitions

### 4.1 Conversation States

```
[Created] ──is_active=true──→ [Active] ──deactivate──→ [Inactive]
                                  │
                                  └──update──→ [Active] (updated_at refreshed)
```

### 4.2 Message Lifecycle

```
[Created] ──expires_at < now()──→ [Expired] ──cleanup_task──→ [Deleted]
     │
     └── created_at + 2 days = expires_at
```

## 5. Data Validation Rules

### 5.1 Conversation

- `user_id` must reference existing user
- `title` auto-generated from first message or timestamp
- `updated_at` refreshed on every new message

### 5.2 Message

- `role` must be one of: user, assistant, system
- `content` cannot be empty
- `expires_at` auto-calculated as `created_at + 2 days`
- `tool_calls` is optional JSON for debugging

### 5.3 User Isolation (Constitution P3-IV)

- All queries MUST filter by `user_id`
- Conversation access requires matching `user_id`
- Message access requires matching `user_id`
- Cross-user access returns 404/403, never empty results

## 6. Migration Strategy

### 6.1 Alembic Migration

```python
# alembic/versions/xxx_add_conversation_message_tables.py

def upgrade():
    # Create conversations table
    op.create_table(
        'conversations',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('is_active', sa.Boolean(), default=True, nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    op.create_index('idx_conversations_user_id', 'conversations', ['user_id'])
    op.create_index('idx_conversations_user_active', 'conversations', ['user_id', 'is_active'])

    # Create messages table
    op.create_table(
        'messages',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('conversation_id', sa.Integer(), sa.ForeignKey('conversations.id'), nullable=False),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('tool_calls', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
    )
    op.create_index('idx_messages_conversation_id', 'messages', ['conversation_id'])
    op.create_index('idx_messages_user_id', 'messages', ['user_id'])
    op.create_index('idx_messages_expires_at', 'messages', ['expires_at'])
    op.create_check_constraint('ck_messages_role', 'messages', "role IN ('user', 'assistant', 'system')")

def downgrade():
    op.drop_table('messages')
    op.drop_table('conversations')
```

## 7. Cleanup Strategy (Constitution P3-V)

### 7.1 Daily Cleanup Task

```python
# src/tasks/message_cleanup.py
def cleanup_expired_messages():
    """Delete messages where expires_at < now()"""
    with Session(engine) as session:
        expired = session.query(Message).filter(Message.expires_at < datetime.utcnow())
        count = expired.delete(synchronize_session=False)
        session.commit()
        return {"deleted": count}
```

### 7.2 Cron Schedule

```bash
# Run daily at 2 AM UTC
0 2 * * * cd /app && python -c "from src.tasks.message_cleanup import cleanup_expired_messages; cleanup_expired_messages()"
```
