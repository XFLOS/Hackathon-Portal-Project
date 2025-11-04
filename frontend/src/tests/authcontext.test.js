/**
 * Tests for AuthContext behavior (Firebase enabled/disabled paths)
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the api module so backend calls don't hit network
jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: { role: 'student' } })),
  },
}));

describe('AuthContext basic flows', () => {
  afterEach(() => jest.resetModules());

  test('when firebase is not configured, AuthProvider sets loading=false', async () => {
    // Mock firebase config to behave as not configured (auth = null)
    jest.doMock('../firebase/config', () => ({
      __esModule: true,
      auth: null,
    }));

    const { AuthProvider, useAuth } = require('../context/AuthContext');

    function TestChild() {
      const { loading } = useAuth();
      return <div>loading:{String(loading)}</div>;
    }

    render(
      <AuthProvider>
        <TestChild />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText(/loading:false/i)).toBeInTheDocument());
  });

  test.skip('when firebase supplies a user, AuthProvider reads role from backend (unstable in CI - mocked firebase causes multiple React copies)', async () => {
    // Ensure a clean module registry so our mocks take effect before modules are loaded
    jest.resetModules();

    // Mock firebase config
    jest.doMock('../firebase/config', () => ({
      __esModule: true,
      auth: {},
    }));

    // Mock firebase/auth onAuthStateChanged to call callback with a fake user
    jest.doMock('firebase/auth', () => ({
      __esModule: true,
      onAuthStateChanged: (auth, cb) => {
        // call callback with a fake user asynchronously
        setTimeout(() => cb({ uid: 'u1', email: 'a@b.com' }), 0);
        return () => {};
      },
      signInWithEmailAndPassword: jest.fn(),
      signOut: jest.fn(),
      createUserWithEmailAndPassword: jest.fn(),
      updateProfile: jest.fn(),
    }));

    // Use isolateModules so the mocks apply while importing the context module
    let AuthProvider, useAuth;
    jest.isolateModules(() => {
      const mod = require('../context/AuthContext');
      AuthProvider = mod.AuthProvider;
      useAuth = mod.useAuth;
    });

    function TestChild() {
      const { loading, role } = useAuth();
      return <div>loading:{String(loading)} role:{String(role)}</div>;
    }

    render(
      <AuthProvider>
        <TestChild />
      </AuthProvider>
    );

    // wait until loading becomes false and role is populated with mocked API role
    await waitFor(() => expect(screen.getByText(/loading:false/i)).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText(/role:student/i)).toBeInTheDocument());
  });
});
