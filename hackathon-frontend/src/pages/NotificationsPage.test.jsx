import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotificationsPage from './NotificationsPage';
import api from '../services/api';

jest.useFakeTimers();

describe('NotificationsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get = jest.fn();
    api.post = jest.fn();
    api.delete = jest.fn();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should fetch and display notifications on mount', async () => {
    const mockNotifications = [
      {
        id: 1,
        user_id: 10,
        title: 'New Team Assignment',
        message: 'You have been assigned to Team Phoenix',
        type: 'info',
        read: false,
        created_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 2,
        user_id: 10,
        title: 'Schedule Updated',
        message: 'Presentation time has been updated',
        type: 'warning',
        read: true,
        created_at: '2025-01-14T12:00:00Z'
      }
    ];

    api.get.mockResolvedValueOnce({ data: mockNotifications });

    render(
      <BrowserRouter>
        <NotificationsPage />
      </BrowserRouter>
    );

    expect(await screen.findByText('New Team Assignment')).toBeInTheDocument();
    expect(screen.getByText('You have been assigned to Team Phoenix')).toBeInTheDocument();
    expect(screen.getByText('Schedule Updated')).toBeInTheDocument();
    expect(screen.getByText('Presentation time has been updated')).toBeInTheDocument();
  });

  it('should display unread count', async () => {
    const mockNotifications = [
      {
        id: 1,
        title: 'Unread 1',
        message: 'Message 1',
        type: 'info',
        read: false,
        created_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 2,
        title: 'Unread 2',
        message: 'Message 2',
        type: 'info',
        read: false,
        created_at: '2025-01-15T11:00:00Z'
      },
      {
        id: 3,
        title: 'Read Notification',
        message: 'Message 3',
        type: 'info',
        read: true,
        created_at: '2025-01-15T09:00:00Z'
      }
    ];

    api.get.mockResolvedValueOnce({ data: mockNotifications });

    render(
      <BrowserRouter>
        <NotificationsPage />
      </BrowserRouter>
    );

    expect(await screen.findByText('2 unread notifications')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mark all as read/i })).toBeInTheDocument();
  });

  it('should show empty state when no notifications exist', async () => {
    api.get.mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <NotificationsPage />
      </BrowserRouter>
    );

    expect(await screen.findByText('No notifications yet')).toBeInTheDocument();
    expect(screen.getByText("You'll be notified when there's something new")).toBeInTheDocument();
  });

  it('should mark single notification as read', async () => {
    const mockNotifications = [
      {
        id: 1,
        title: 'Test Notification',
        message: 'Test Message',
        type: 'info',
        read: false,
        created_at: '2025-01-15T10:00:00Z'
      }
    ];

    api.get.mockResolvedValueOnce({ data: mockNotifications });
    api.post.mockResolvedValueOnce({ data: { message: 'Notification marked as read' } });

    render(
      <BrowserRouter>
        <NotificationsPage />
      </BrowserRouter>
    );

    const markReadBtn = await screen.findByRole('button', { name: /mark as read/i });
    fireEvent.click(markReadBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/notifications/1/read');
    });

    expect(await screen.findByText('Notification marked as read')).toBeInTheDocument();
  });

  it('should mark all notifications as read', async () => {
    const mockNotifications = [
      {
        id: 1,
        title: 'Notification 1',
        message: 'Message 1',
        type: 'info',
        read: false,
        created_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 2,
        title: 'Notification 2',
        message: 'Message 2',
        type: 'info',
        read: false,
        created_at: '2025-01-15T11:00:00Z'
      }
    ];

    api.get.mockResolvedValueOnce({ data: mockNotifications });
    api.post.mockResolvedValueOnce({ data: { message: 'All notifications marked as read' } });

    render(
      <BrowserRouter>
        <NotificationsPage />
      </BrowserRouter>
    );

    const markAllBtn = await screen.findByRole('button', { name: /mark all as read/i });
    fireEvent.click(markAllBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/notifications/mark-all-read');
    });

    expect(await screen.findByText('All notifications marked as read')).toBeInTheDocument();
  });

  it('should delete notification with confirmation', async () => {
    const mockNotifications = [
      {
        id: 1,
        title: 'Test Notification',
        message: 'Test Message',
        type: 'info',
        read: false,
        created_at: '2025-01-15T10:00:00Z'
      }
    ];

    api.get.mockResolvedValueOnce({ data: mockNotifications });
    api.delete.mockResolvedValueOnce({ data: { message: 'Notification deleted successfully' } });

    window.confirm = jest.fn(() => true);

    render(
      <BrowserRouter>
        <NotificationsPage />
      </BrowserRouter>
    );

    const deleteBtn = await screen.findByRole('button', { name: /delete notification/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this notification?');
      expect(api.delete).toHaveBeenCalledWith('/notifications/1');
    });

    expect(await screen.findByText('Notification deleted')).toBeInTheDocument();
  });

  it('should not delete notification if user cancels confirmation', async () => {
    const mockNotifications = [
      {
        id: 1,
        title: 'Test Notification',
        message: 'Test Message',
        type: 'info',
        read: false,
        created_at: '2025-01-15T10:00:00Z'
      }
    ];

    api.get.mockResolvedValueOnce({ data: mockNotifications });
    window.confirm = jest.fn(() => false);

    render(
      <BrowserRouter>
        <NotificationsPage />
      </BrowserRouter>
    );

    const deleteBtn = await screen.findByRole('button', { name: /delete notification/i });
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(api.delete).not.toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    api.get.mockRejectedValueOnce({
      response: { data: { message: 'Failed to fetch notifications' } }
    });

    render(
      <BrowserRouter>
        <NotificationsPage />
      </BrowserRouter>
    );

    expect(await screen.findByText('Failed to fetch notifications')).toBeInTheDocument();
  });

  it('should display notification type badges correctly', async () => {
    const mockNotifications = [
      {
        id: 1,
        title: 'Info Notification',
        message: 'Info message',
        type: 'info',
        read: false,
        created_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 2,
        title: 'Warning Notification',
        message: 'Warning message',
        type: 'warning',
        read: false,
        created_at: '2025-01-15T11:00:00Z'
      },
      {
        id: 3,
        title: 'Success Notification',
        message: 'Success message',
        type: 'success',
        read: false,
        created_at: '2025-01-15T12:00:00Z'
      }
    ];

    api.get.mockResolvedValueOnce({ data: mockNotifications });

    const { container } = render(
      <BrowserRouter>
        <NotificationsPage />
      </BrowserRouter>
    );

    await screen.findByText('Info Notification');

    const infoBadge = container.querySelector('.notification-type-badge');
    expect(infoBadge).toHaveTextContent('info');

    expect(screen.getByText((content, element) => {
      return element?.className === 'notification-type-badge' && content === 'warning';
    })).toBeInTheDocument();

    expect(screen.getByText((content, element) => {
      return element?.className === 'notification-type-badge' && content === 'success';
    })).toBeInTheDocument();
  });
});
