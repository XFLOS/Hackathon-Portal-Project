# Hackathon Portal Frontend - Code Quality Setup

## Linting & Code Quality Tools

This project now includes ESLint and Stylelint for maintaining code quality.

### Available Commands

```bash
# Run ESLint on JavaScript/JSX files
npm run lint

# Auto-fix ESLint issues
npm run lint:fix

# Run Stylelint on CSS files
npm run lint:css

# Auto-fix Stylelint issues
npm run lint:css:fix
```

### Installation

Install the new dev dependencies:

```bash
npm install
```

This will install:
- `eslint` - JavaScript/JSX linting
- `eslint-plugin-react` - React-specific rules
- `eslint-plugin-react-hooks` - React Hooks rules
- `stylelint` - CSS linting
- `stylelint-config-standard` - Standard CSS rules

### Error Handling

The app now includes:

1. **ErrorBoundary Component** - Catches React errors and displays fallback UI
2. **useApi Hook** - Handles API calls with loading/error states automatically
3. **Alert Component** - Reusable component for user notifications

### Usage Examples

#### Using useApi Hook

```jsx
import { useApi } from '../hooks/useApi';

function MyComponent() {
  const { data, loading, error, refetch } = useApi('/team/me');

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert type="error" message={error} />;
  
  return <div>{data?.name}</div>;
}
```

#### Using useLazyApi Hook

```jsx
import { useLazyApi } from '../hooks/useApi';

function MyComponent() {
  const { data, loading, error, execute } = useLazyApi('/team/create', 'POST');

  const handleCreate = async () => {
    try {
      await execute({ name: 'My Team' });
    } catch (err) {
      // Error already set in hook
    }
  };

  return (
    <>
      {error && <Alert type="error" message={error} />}
      <button onClick={handleCreate} disabled={loading}>
        {loading ? 'Creating...' : 'Create Team'}
      </button>
    </>
  );
}
```

#### Using Alert Component

```jsx
import Alert from '../components/ui/Alert';

<Alert type="success" title="Success!" message="Team created successfully" />
<Alert type="error" title="Error" message="Failed to create team" />
<Alert type="warning" message="This action cannot be undone" />
<Alert type="info" message="Please verify your email" />
```

### Best Practices

1. **Always use useApi hook** for API calls instead of direct axios calls
2. **Wrap components in ErrorBoundary** for critical sections
3. **Use Alert component** for user feedback instead of native alerts
4. **Run linting before committing** with `npm run lint` and `npm run lint:css`
5. **Handle loading states** to provide better UX
6. **Validate props** with PropTypes or TypeScript in the future

### Testing

Run tests with:

```bash
npm test
```

### Build

Build for production:

```bash
npm run build
```

This will create an optimized production build with all linting checks passing.
