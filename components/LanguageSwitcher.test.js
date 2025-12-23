import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import LanguageSwitcher from './LanguageSwitcher';


jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn(),
}))


jest.mock('next/link', () => {
  return ({ children, href }) => children
})

describe('LanguageSwitcher Component', () => {
  const mockPush = jest.fn()
  const mockT = jest.fn((key) => {
    const translations = {
      'components:languageSwitcher.english': 'English',
      'components:languageSwitcher.belarusianLatin': 'Belarusian (Latin)',
    }
    return translations[key] || key
  })

  beforeEach(() => {
    mockPush.mockClear()
    
    useRouter.mockReturnValue({
      locale: 'en',
      pathname: '/test',
      asPath: '/test',
      push: mockPush,
    })
    
    useTranslation.mockReturnValue({
      t: mockT,
    })
  })

  
  it('renders language switcher with correct buttons', () => {
    render(<LanguageSwitcher />)
    
    expect(screen.getByText('EN')).toBeInTheDocument()
    expect(screen.getByText('BY')).toBeInTheDocument()
    
    
    const englishButton = screen.getByText('EN').closest('button')
    expect(englishButton).toHaveClass('active')
    
    
    expect(mockT).toHaveBeenCalledWith('components:languageSwitcher.english')
    expect(mockT).toHaveBeenCalledWith('components:languageSwitcher.belarusianLatin')
  })

  
  it('shows correct active language', () => {
    useRouter.mockReturnValue({
      locale: 'be-Latn',
      pathname: '/test',
      asPath: '/test',
      push: mockPush,
    })
    
    render(<LanguageSwitcher />)
    
    const belarusianButton = screen.getByText('BY').closest('button')
    expect(belarusianButton).toHaveClass('active')
  })

  
  it('changes language when button is clicked', async () => {
    render(<LanguageSwitcher />)
    
    const belarusianButton = screen.getByText('BY')
    
    
    fireEvent.click(belarusianButton)
    
    
    expect(mockPush).toHaveBeenCalledWith(
      '/test',
      '/test',
      { locale: 'be-Latn' }
    )
  })

  
  it('has correct titles on buttons', () => {
    render(<LanguageSwitcher />)
    
    const englishButton = screen.getByText('EN').closest('button')
    const belarusianButton = screen.getByText('BY').closest('button')
    
    expect(englishButton).toHaveAttribute('title', 'English')
    expect(belarusianButton).toHaveAttribute('title', 'Belarusian (Latin)')
  })

  
  it('applies correct CSS classes', () => {
    render(<LanguageSwitcher />)
    
    const container = screen.getByText('EN').closest('.language-switcher')
    
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass('language-switcher')
    
    
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
  })

  
  it('handles missing translation gracefully', () => {
    const mockTWithMissing = jest.fn((key) => {
     
      if (key === 'components:languageSwitcher.belarusianLatin') {
        return key 
      }
      return 'English'
    })
    
    useTranslation.mockReturnValue({
      t: mockTWithMissing,
    })
    
    render(<LanguageSwitcher />)
    
    
    expect(screen.getByText('BY')).toBeInTheDocument()
  })

  
  it('has correct language structure', () => {
    render(<LanguageSwitcher />)
    
    
    const buttons = screen.getAllByRole('button')
    
    expect(buttons[0]).toHaveTextContent('EN')
    expect(buttons[1]).toHaveTextContent('BY')
  })

 
  it('is accessible', () => {
    render(<LanguageSwitcher />)
    
    const buttons = screen.getAllByRole('button')
    
    
    buttons.forEach(button => {
      expect(button).toHaveAttribute('title')
    })
    
    
    buttons.forEach(button => {
      expect(button).not.toBeDisabled()
    })
  })

  
  it('has responsive styling', () => {
    render(<LanguageSwitcher />)
    
    const container = screen.getByText('EN').closest('.language-switcher')
    
    
    expect(container).toHaveStyle('display: flex')
    
  })

  
  it('updates when router locale changes', () => {
    const { rerender } = render(<LanguageSwitcher />)
    
    
    let englishButton = screen.getByText('EN').closest('button')
    expect(englishButton).toHaveClass('active')
    
    
    useRouter.mockReturnValue({
      locale: 'be-Latn',
      pathname: '/test',
      asPath: '/test',
      push: mockPush,
    })
    
    
    rerender(<LanguageSwitcher />)
    
    
    const belarusianButton = screen.getByText('BY').closest('button')
    expect(belarusianButton).toHaveClass('active')
    expect(englishButton).not.toHaveClass('active')
  })
})


describe('changeLanguage function', () => {
  it('calls router.push with correct arguments', async () => {
    const mockPush = jest.fn()
    
    useRouter.mockReturnValue({
      locale: 'en',
      pathname: '/about',
      asPath: '/about?page=1',
      push: mockPush,
    })
    
    render(<LanguageSwitcher />)
    
    const belarusianButton = screen.getByText('BY')
    fireEvent.click(belarusianButton)
    
    expect(mockPush).toHaveBeenCalledWith(
      '/about',
      '/about?page=1',
      { locale: 'be-Latn' }
    )
  })
  
  it('preserves query parameters', async () => {
    const mockPush = jest.fn()
    
    useRouter.mockReturnValue({
      locale: 'en',
      pathname: '/products',
      asPath: '/products?category=books&sort=price',
      push: mockPush,
    })
    
    render(<LanguageSwitcher />)
    
    const belarusianButton = screen.getByText('BY')
    fireEvent.click(belarusianButton)
    
    expect(mockPush).toHaveBeenCalledWith(
      '/products',
      '/products?category=books&sort=price',
      { locale: 'be-Latn' }
    )
  })
})