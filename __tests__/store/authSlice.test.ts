import { configureStore, Reducer } from "@reduxjs/toolkit";
import authReducer, {
  signUp,
  login,
  logout,
  refreshAccessToken,
  setUser,
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectAuth,
} from "../../src/store/slices/authSlice";
import { RootState } from "../../src/store";
import * as authApi from "../../src/services/api/authApi";
import * as secureStore from "../../src/services/storage/secureStore";
import logger from "../../src/services/logger";

jest.mock("../../src/services/api/authApi");
jest.mock("../../src/services/storage/secureStore");
jest.mock("../../src/services/logger");

interface ExtendedRootState extends RootState {
  auth: ReturnType<typeof authReducer>;
}

type TestRootState = {
  auth: ReturnType<typeof authReducer>;
};

type TestStore = ReturnType<typeof createTestStore>;

function createTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      auth: authReducer as Reducer,
      deck: (() => ({})) as any,
      card: (() => ({})) as any,
      study: (() => ({})) as any,
      spacedRep: (() => ({})) as any,
      ui: (() => ({})) as any,
      sync: (() => ({})) as any,
    },
    preloadedState,
  });
}

const mockUser = {
  id: "user-123",
  email: "test@example.com",
  created_at: "2025-11-19T10:00:00Z",
};

const mockTokens = {
  access_token: "access-token-123",
  refresh_token: "refresh-token-456",
};

describe("authSlice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have correct default values", () => {
      const store = createTestStore();
      const state = store.getState().auth;

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("signUp async thunk", () => {
    it("should set loading to true on pending", () => {
      const store = createTestStore();

      store.dispatch(
        signUp.pending("", { email: "test@example.com", password: "password" })
      );

      const state = store.getState().auth;
      expect(state.loading).toBe(true);
    });

    it("should set user and token on fulfilled", async () => {
      (authApi.signUp as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          user: mockUser,
          ...mockTokens,
        },
      });
      (secureStore.storeAuthTokens as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      const store = createTestStore();

      await store.dispatch(
        signUp({ email: "test@example.com", password: "password" })
      );

      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockTokens.access_token);
      expect(state.refreshToken).toBe(mockTokens.refresh_token);
      expect(state.isAuthenticated).toBe(true);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("should set error on rejected", async () => {
      const errorMessage = "Email already exists";
      (authApi.signUp as jest.Mock).mockRejectedValueOnce(
        new Error(errorMessage)
      );

      const store = createTestStore();

      const result = await store.dispatch(
        signUp({ email: "test@example.com", password: "password" })
      );

      const state = store.getState().auth;
      expect(state.error).toBeTruthy();
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
    });

    it("should call secureStore to save tokens", async () => {
      (authApi.signUp as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          user: mockUser,
          ...mockTokens,
        },
      });
      (secureStore.storeAuthTokens as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      const store = createTestStore();

      await store.dispatch(
        signUp({ email: "test@example.com", password: "password" })
      );

      expect(secureStore.storeAuthTokens).toHaveBeenCalledWith(
        mockTokens.access_token,
        mockTokens.refresh_token
      );
    });
  });

  describe("login async thunk", () => {
    it("should authenticate user with valid credentials", async () => {
      (authApi.login as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          user: mockUser,
          ...mockTokens,
        },
      });
      (secureStore.storeAuthTokens as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      const store = createTestStore();

      await store.dispatch(
        login({ email: "test@example.com", password: "password" })
      );

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
    });

    it("should reject with invalid credentials", async () => {
      (authApi.login as jest.Mock).mockRejectedValueOnce(
        new Error("Invalid credentials")
      );

      const store = createTestStore();

      await store.dispatch(
        login({ email: "test@example.com", password: "wrong" })
      );

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBeTruthy();
    });
  });

  describe("logout async thunk", () => {
    it("should clear user and tokens", async () => {
      const preloadedState = {
        auth: {
          user: mockUser,
          token: mockTokens.access_token,
          refreshToken: mockTokens.refresh_token,
          loading: false,
          error: null,
          isAuthenticated: true,
        },
      };

      (secureStore.clearAuthTokens as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      const store = createTestStore(preloadedState);

      await store.dispatch(logout());

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it("should call secureStore to clear tokens", async () => {
      const preloadedState = {
        auth: {
          user: mockUser,
          token: mockTokens.access_token,
          refreshToken: mockTokens.refresh_token,
          loading: false,
          error: null,
          isAuthenticated: true,
        },
      };

      (secureStore.clearAuthTokens as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      const store = createTestStore(preloadedState);

      await store.dispatch(logout());

      expect(secureStore.clearAuthTokens).toHaveBeenCalled();
    });
  });

  describe("refreshAccessToken async thunk", () => {
    it("should refresh token successfully", async () => {
      (authApi.refreshToken as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          access_token: "new-access-token",
          refresh_token: "new-refresh-token",
        },
      });
      (secureStore.storeAuthTokens as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      const preloadedState = {
        auth: {
          user: mockUser,
          token: mockTokens.access_token,
          refreshToken: mockTokens.refresh_token,
          loading: false,
          error: null,
          isAuthenticated: true,
        },
      };

      const store = createTestStore(preloadedState);

      await store.dispatch(refreshAccessToken(mockTokens.refresh_token));

      const state = store.getState().auth;
      expect(state.token).toBe("new-access-token");
      expect(state.refreshToken).toBe("new-refresh-token");
    });

    it("should handle refresh token expiration", async () => {
      (authApi.refreshToken as jest.Mock).mockRejectedValueOnce(
        new Error("Token expired")
      );

      const preloadedState = {
        auth: {
          user: mockUser,
          token: mockTokens.access_token,
          refreshToken: mockTokens.refresh_token,
          loading: false,
          error: null,
          isAuthenticated: true,
        },
      };

      const store = createTestStore(preloadedState);

      await store.dispatch(refreshAccessToken(mockTokens.refresh_token));

      const state = store.getState().auth;
      expect(state.error).toBeTruthy();
    });
  });

  describe("setUser action", () => {
    it("should set user without affecting authentication state", () => {
      const store = createTestStore();

      store.dispatch(setUser(mockUser));

      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
    });
  });

  describe("selectors", () => {
    it("selectUser should return user", () => {
      const preloadedState = {
        auth: {
          user: mockUser,
          token: null,
          refreshToken: null,
          loading: false,
          error: null,
          isAuthenticated: false,
        },
      };

      const store = createTestStore(preloadedState);
      const state = store.getState();
      const user = selectUser(state);

      expect(user).toEqual(mockUser);
    });

    it("selectIsAuthenticated should return authentication status", () => {
      const preloadedState = {
        auth: {
          user: mockUser,
          token: mockTokens.access_token,
          refreshToken: mockTokens.refresh_token,
          loading: false,
          error: null,
          isAuthenticated: true,
        },
      } as any;

      const store = createTestStore(preloadedState);
      const state = store.getState();
      const isAuthenticated = selectIsAuthenticated(state as any);

      expect(isAuthenticated).toBe(true);
    });

    it("selectLoading should return loading state", () => {
      const preloadedState = {
        auth: {
          user: null,
          token: null,
          refreshToken: null,
          loading: true,
          error: null,
          isAuthenticated: false,
        },
      } as any;

      const store = createTestStore(preloadedState);
      const state = store.getState();
      const loading = selectAuthLoading(state as any);

      expect(loading).toBe(true);
    });

    it("selectError should return error message", () => {
      const errorMessage = "Invalid credentials";
      const preloadedState = {
        auth: {
          user: null,
          token: null,
          refreshToken: null,
          loading: false,
          error: errorMessage,
          isAuthenticated: false,
        },
      } as any;

      const store = createTestStore(preloadedState);
      const state = store.getState();
      const error = selectAuthError(state as any);

      expect(error).toBe(errorMessage);
    });

    it("selectToken should return token", () => {
      const preloadedState = {
        auth: {
          user: mockUser,
          token: mockTokens.access_token,
          refreshToken: mockTokens.refresh_token,
          loading: false,
          error: null,
          isAuthenticated: true,
        },
      } as any;

      const store = createTestStore(preloadedState);
      const state = store.getState();
      const token = selectAuth(state as any).token;

      expect(token).toBe(mockTokens.access_token);
    });
  });

  describe("edge cases", () => {
    it("should handle missing user in signup response", async () => {
      (authApi.signUp as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          user: null,
          ...mockTokens,
        },
      });
      (secureStore.storeAuthTokens as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      const store = createTestStore();

      await store.dispatch(
        signUp({ email: "test@example.com", password: "password" })
      );

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeTruthy();
    });

    it("should not authenticate with null token", async () => {
      (authApi.login as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          user: mockUser,
          access_token: null,
          refresh_token: null,
        },
      });
      (secureStore.storeAuthTokens as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      const store = createTestStore();

      await store.dispatch(
        login({ email: "test@example.com", password: "password" })
      );

      const state = store.getState().auth;
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
