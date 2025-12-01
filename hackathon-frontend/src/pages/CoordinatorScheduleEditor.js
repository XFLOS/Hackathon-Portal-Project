export default function CoordinatorScheduleEditor() {
  const [events, setEvents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  // ...existing state declarations...

  // Fetch events from backend
  const fetchEvents = React.useCallback(() => {
    setLoading(true);
    setError(null);
    api.get('/coordinator/schedule')
      .then(res => {
        const sorted = (res.data || []).slice().sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
        setEvents(sorted);
      })
      .catch(() => setError('Failed to load schedule'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // In all create, edit, delete handlers, call fetchEvents() after success
  // ...existing code, but replace setEvents logic after successful create/edit/delete with fetchEvents()...
}