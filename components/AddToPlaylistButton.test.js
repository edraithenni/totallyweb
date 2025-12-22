/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AddToPlaylistButton from "./AddToPlaylistButton";

// Мокаем fetch
global.fetch = jest.fn();
// Мокаем alert
global.alert = jest.fn();

describe("AddToPlaylistButton component", () => {
  beforeEach(() => {
    fetch.mockClear();
    alert.mockClear();
  });

  test("renders button and opens modal", async () => {
    // Мокаем ответ API загрузки плейлистов
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: "My Playlist" },
        { id: 2, name: "Favorites" }
      ]
    });

    await act(async () => {
      render(<AddToPlaylistButton movieId={10} movieTitle="Test Movie" />);
    });

    // Кнопка на экране
    const button = screen.getByText("Add to Playlist");
    expect(button).toBeInTheDocument();

    // Кликаем
    await act(async () => {
      fireEvent.click(button);
    });

    // Ждём появления модалки - используем более специфичный селектор
    await waitFor(() => {
      // Ищем заголовок h3 вместо общего текста
      expect(screen.getByRole("heading", { name: /Add to Playlist/i })).toBeInTheDocument();
    });
    
    expect(screen.getByText('"Test Movie"')).toBeInTheDocument();

    // Убедимся, что fetch был вызван для загрузки плейлистов
    expect(fetch).toHaveBeenCalledWith("/api/users/me/playlists", expect.anything());
  });

  test("displays playlists in modal", async () => {
    // Мокаем загрузку плейлистов
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 100, name: "Workout Mix" }
      ]
    });

    await act(async () => {
      render(<AddToPlaylistButton movieId={10} movieTitle="Test Movie" />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Add to Playlist"));
    });

    // Ждём появление плейлиста
    const playlistName = await screen.findByText("Workout Mix");
    expect(playlistName).toBeInTheDocument();
  });

  test("allows adding movie to playlist", async () => {
    // 1) Ответ на загрузку плейлистов
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 5, name: "Chill Vibes" }
      ]
    });

    // 2) Ответ addToPlaylist
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    await act(async () => {
      render(<AddToPlaylistButton movieId={777} movieTitle="Demo Movie" />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Add to Playlist"));
    });

    const addBtn = await screen.findByText("Add");
    
    await act(async () => {
      fireEvent.click(addBtn);
    });

    // Ждём завершения запроса
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/playlists/5/add",
      expect.objectContaining({
        method: "POST",
      })
    );
  });
});