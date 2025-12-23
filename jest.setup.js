import '@testing-library/jest-dom'

// Мокаем глобальные функции
beforeAll(() => {
  // Мок для alert
  global.alert = jest.fn()
  
  // Мок для console.log чтобы не засорять вывод тестов
  jest.spyOn(console, 'log').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
  jest.spyOn(console, 'warn').mockImplementation(() => {})
})

afterAll(() => {
  // Восстанавливаем оригинальные функции
  console.log.mockRestore()
  console.error.mockRestore()
  console.warn.mockRestore()
  if (global.alert.mockRestore) {
    global.alert.mockRestore()
  }
})