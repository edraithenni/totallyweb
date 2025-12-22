/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import Header from "./header";

// Мокаем модалку с поддержкой onSuccess
jest.mock("./SignInModal", () => ({ open, onSuccess }) => (
  <div data-testid="signin-modal">
    {open ? "OPEN" : "CLOSED"}
    {open && <button onClick={() => onSuccess()}>Mock Login Success</button>}
  </div>
));

// Мокаем next/head
jest.mock("next/head", () => {
  return function Head({ children }) {
    return <>{children}</>;
  };
});

// Глобальный fetch мок
global.fetch = jest.fn();

describe("Header component", () => {
  beforeEach(() => {
    fetch.mockClear();
    // Сбрасываем состояние между тестами
    jest.clearAllMocks();
  });

  test("shows Sign in + Sign up when user is NOT logged in", async () => {
    // API возвращает 401 → пользователь не залогинен
    fetch.mockResolvedValueOnce({ ok: false });

    await act(async () => {
      render(<Header />);
    });

    await waitFor(() => {
      expect(screen.getByText("Sign in")).toBeInTheDocument();
    });
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  test("shows Profile + Log out when user IS logged in", async () => {
    // API возвращает 200 → пользователь залогинен
    fetch.mockResolvedValueOnce({ ok: true });

    await act(async () => {
      render(<Header />);
    });

    await waitFor(() => {
      expect(screen.getByText("Profile")).toBeInTheDocument();
    });
    expect(screen.getByText("Log out")).toBeInTheDocument();
  });

  test("opens SignInModal when clicking Sign in", async () => {
    fetch.mockResolvedValueOnce({ ok: false });

    await act(async () => {
      render(<Header />);
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText("Sign in"));
    });

    expect(screen.getByTestId("signin-modal")).toHaveTextContent("OPEN");
  });

  test("logout triggers API call and sets loggedIn = false", async () => {
    // Первый запрос: проверка авторизации (успешно)
    fetch.mockResolvedValueOnce({ ok: true });
    // Второй запрос: logout (успешно)
    fetch.mockResolvedValueOnce({ ok: true });

    await act(async () => {
      render(<Header />);
    });

    await waitFor(() => {
      expect(screen.getByText("Profile")).toBeInTheDocument();
    });

    const logoutBtn = screen.getByText("Log out");
    
    await act(async () => {
      fireEvent.click(logoutBtn);
    });

    // Ждём завершения запроса
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    expect(fetch).toHaveBeenLastCalledWith(
      "/api/auth/logout",
      expect.objectContaining({ 
        method: "POST",
        credentials: "include"
      })
    );
  });

  test("onSuccess from SignInModal sets loggedIn = true", async () => {
    // Первый запрос: пользователь не залогинен
    fetch.mockResolvedValueOnce({ ok: false });
    // Второй запрос: после успешного логина
    fetch.mockResolvedValueOnce({ ok: true });

    await act(async () => {
      render(<Header />);
    });

    await waitFor(() => {
      expect(screen.getByText("Sign in")).toBeInTheDocument();
    });

    // Открываем модалку
    fireEvent.click(screen.getByText("Sign in"));
    
    // Нажимаем кнопку "логина" внутри моковой модалки
    const mockLoginButton = screen.getByText("Mock Login Success");
    
    await act(async () => {
      fireEvent.click(mockLoginButton);
    });

    // Ждём, когда появится текст "Profile" (признак успешного логина)
    await waitFor(() => {
      expect(screen.getByText("Profile")).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});