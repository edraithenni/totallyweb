import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AddToPlaylistButton from './AddToPlaylistButton'


global.fetch = jest.fn()
global.alert = jest.fn()

describe('AddToPlaylistButton Component', () => {
  const mockMovieId = '123'
  const mockMovieTitle = 'Demo Movie'
  
  beforeEach(() => {
    fetch.mockClear()
    alert.mockClear()
    jest.clearAllMocks()
  })

  afterEach(() => {
    alert.mockRestore()
  })

  // Рендеринг основной кнопки
  it('renders the main "Add to Playlist" button', () => {
    render(<AddToPlaylistButton movieId={mockMovieId} movieTitle={mockMovieTitle} />)
    const mainButton = screen.getByRole('button', { 
      name: /add to playlist/i 
    })
    expect(mainButton).toBeInTheDocument()
    expect(mainButton).toBeEnabled()
  })

  // Открытие модального окна при клике 
  it('opens modal when main button is clicked', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([
        { id: 1, name: 'My Playlist' },
        { id: 2, name: 'Favorites' }
      ])
    })

    render(<AddToPlaylistButton movieId={mockMovieId} movieTitle={mockMovieTitle} />)
    
    const mainButton = screen.getByRole('button', { name: /add to playlist/i })
    fireEvent.click(mainButton)

    
    await waitFor(() => {
      const modalTitle = screen.getByRole('heading', { 
        level: 3, 
        name: 'Add to Playlist' 
      })
      expect(modalTitle).toBeInTheDocument()
    })
    
    
    expect(screen.getByText(`"${mockMovieTitle}"`)).toBeInTheDocument()
    
    
    expect(fetch).toHaveBeenCalledWith(
      '/api/users/me/playlists',
      expect.objectContaining({
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
    )
  })

  // Отображение плейлистов после загрузки (ИСПРАВЛЕНО)
  it('displays playlists after loading', async () => {
    const mockPlaylists = [
      { id: 1, name: 'Workout Mix' },
      { id: 2, name: 'Chill Vibes' }
    ]
    
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockPlaylists
    })

    render(<AddToPlaylistButton movieId={mockMovieId} movieTitle={mockMovieTitle} />)
    
    const mainButton = screen.getByRole('button', { name: /add to playlist/i })
    fireEvent.click(mainButton)

    await waitFor(() => {
      mockPlaylists.forEach(playlist => {
        expect(screen.getByText(playlist.name)).toBeInTheDocument()
      })
    })
    
    const addButtons = screen.getAllByTitle('Add to this playlist')
    expect(addButtons).toHaveLength(mockPlaylists.length)
  })

  // Отображение сообщения при отсутствии плейлистов
  it('shows message when no playlists exist', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [] 
    })

    render(<AddToPlaylistButton movieId={mockMovieId} movieTitle={mockMovieTitle} />)
    
    const mainButton = screen.getByRole('button', { name: /add to playlist/i })
    fireEvent.click(mainButton)

    await waitFor(() => {
      expect(screen.getByText(/no playlists yet/i)).toBeInTheDocument()
    })
  })

  // Ошибка при загрузке плейлистов
  it('shows error when playlist loading fails', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'Server error'
    })

    render(<AddToPlaylistButton movieId={mockMovieId} movieTitle={mockMovieTitle} />)
    
    const mainButton = screen.getByRole('button', { name: /add to playlist/i })
    fireEvent.click(mainButton)

    await waitFor(() => {
      expect(screen.getByText(/failed to load playlists/i)).toBeInTheDocument()
    })
  })

  // Добавление фильма в плейлист 
 it('adds movie to playlist when add button is clicked', async () => {
    const mockPlaylists = [{ id: 1, name: 'My Playlist' }]
    
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockPlaylists
    })
    
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    })

    render(<AddToPlaylistButton movieId={mockMovieId} movieTitle={mockMovieTitle} />)
    
    const mainButton = screen.getByRole('button', { name: /add to playlist/i })
    fireEvent.click(mainButton)

    await waitFor(() => {
      expect(screen.getByText('My Playlist')).toBeInTheDocument()
    })
    
    
    const addButton = screen.getByTitle('Add to this playlist')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2)
      expect(fetch).toHaveBeenLastCalledWith(
        `/api/playlists/1/add`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ movie_id: parseInt(mockMovieId) })
        })
      )
      expect(alert).toHaveBeenCalledWith('Movie added to playlist!')
    })
  })

  // Создание нового плейлиста
  it('creates new playlist when name is entered', async () => {
    const newPlaylistName = 'New Playlist'
    const createdPlaylist = { id: 3, name: newPlaylistName }
    
    
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => []
    })
    
    
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => createdPlaylist
    })
    
    
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    })

    render(<AddToPlaylistButton movieId={mockMovieId} movieTitle={mockMovieTitle} />)
    const mainButton = screen.getByRole('button', { name: /add to playlist/i })
    fireEvent.click(mainButton)

    await waitFor(() => {
      const input = screen.getByPlaceholderText(/enter playlist name/i)
      fireEvent.change(input, { target: { value: newPlaylistName } })
      
      const createButton = screen.getByRole('button', { name: /create/i })
      expect(createButton).toBeEnabled()
      
      
      fireEvent.click(createButton)
    })

    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/playlists',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: newPlaylistName })
        })
      )
    })
  })

 

  // Закрытие модального окна 
  it('closes modal when close button is clicked', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => []
    })

    const { container } = render(
      <AddToPlaylistButton movieId={mockMovieId} movieTitle={mockMovieTitle} />
    )
    
    
    const mainButton = screen.getByRole('button', { name: /add to playlist/i })
    fireEvent.click(mainButton)

    
    await waitFor(() => {
      const modalTitle = screen.getByRole('heading', { 
        level: 3, 
        name: 'Add to Playlist' 
      })
      expect(modalTitle).toBeInTheDocument()
    })
    
    
    const closeButton = screen.getByRole('button', { name: '×' })
    fireEvent.click(closeButton)

    
    await waitFor(() => {
      const modalTitle = screen.queryByRole('heading', { 
        level: 3, 
        name: 'Add to Playlist' 
      })
      expect(modalTitle).not.toBeInTheDocument()
    })
  })

  // Перезагрузка плейлистов
  it('reloads playlists when reload button is clicked', async () => {
    const mockPlaylists1 = [{ id: 1, name: 'Playlist 1' }]
    const mockPlaylists2 = [{ id: 1, name: 'Playlist 1' }, { id: 2, name: 'Playlist 2' }]
    
    
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockPlaylists1
    })
    
    
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockPlaylists2
    })

    render(<AddToPlaylistButton movieId={mockMovieId} movieTitle={mockMovieTitle} />)
    
    
    const mainButton = screen.getByRole('button', { name: /add to playlist/i })
    fireEvent.click(mainButton)

    
    await waitFor(() => {
      expect(screen.getByText('Playlist 1')).toBeInTheDocument()
    })
    
    
    const reloadButton = screen.getByRole('button', { name: /reload/i })
    fireEvent.click(reloadButton)

    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2)
    })
  })

  // Закрытие модального окна по клику на оверлей 
  it('closes modal when clicking overlay', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => []
    })

    render(<AddToPlaylistButton movieId={mockMovieId} movieTitle={mockMovieTitle} />)
    
    
    const mainButton = screen.getByRole('button', { name: /add to playlist/i })
    fireEvent.click(mainButton)

    
    await waitFor(() => {
      const modalTitle = screen.getByRole('heading', { 
        level: 3, 
        name: 'Add to Playlist' 
      })
      expect(modalTitle).toBeInTheDocument()
    })
    
    const overlay = document.querySelector('.modal-overlay')
    if (overlay) {
      fireEvent.click(overlay)
    }
    
    await waitFor(() => {
      const modalTitle = screen.queryByRole('heading', { 
        level: 3, 
        name: 'Add to Playlist' 
      })
      expect(modalTitle).not.toBeInTheDocument()
    })
  })

  // Состояние загрузки 
  it('shows loading state during API calls', async () => {
    let resolveFetch
    const fetchPromise = new Promise(resolve => {
      resolveFetch = () => resolve({
        ok: true,
        status: 200,
        json: async () => []
      })
    })
    
    fetch.mockImplementation(() => fetchPromise)

    render(<AddToPlaylistButton movieId={mockMovieId} movieTitle={mockMovieTitle} />)
    
    const mainButton = screen.getByRole('button', { name: /add to playlist/i })
    fireEvent.click(mainButton)

    
    await waitFor(() => {
      const createButton = screen.getByRole('button', { name: /create/i })
      expect(createButton).toBeDisabled()
    })
    resolveFetch()
  })

  // Добавление фильма показывает alert при успехе
  it('shows alert when movie is successfully added', async () => {
    const mockPlaylists = [{ id: 1, name: 'Test Playlist' }]
    
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockPlaylists
    })
    
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    })

    render(<AddToPlaylistButton movieId={mockMovieId} movieTitle={mockMovieTitle} />)
    
    const mainButton = screen.getByRole('button', { name: /add to playlist/i })
    fireEvent.click(mainButton)

    await waitFor(() => {
      expect(screen.getByText('Test Playlist')).toBeInTheDocument()
    })
    
    const addButton = screen.getByTitle('Add to this playlist')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith('Movie added to playlist!')
    })
  })

  const getAddToPlaylistButtons = () => {
    return screen.getAllByTitle('Add to this playlist')
  }
})
