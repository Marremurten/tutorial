import React from 'react'
import { render, screen } from '@testing-library/react'
import Footer from '../Footer'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) {
    return <a href={href} className={className}>{children}</a>
  }
})

describe('Footer Component', () => {
  describe('Rendering', () => {
    it('renders without errors', () => {
      render(<Footer />)
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('displays all required elements', () => {
      render(<Footer />)
      
      // Check for navigation links
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('About')).toBeInTheDocument()
      expect(screen.getByText('Contact')).toBeInTheDocument()
      
      // Check for copyright text
      expect(screen.getByText(/© \d{4}.*All rights reserved/)).toBeInTheDocument()
    })

    it('handles custom company name prop', () => {
      const customCompany = 'My Custom Company'
      render(<Footer companyName={customCompany} />)
      
      expect(screen.getByText(new RegExp(customCompany))).toBeInTheDocument()
    })

    it('uses default company name when prop not provided', () => {
      render(<Footer />)
      
      // Should have some default company name in copyright
      expect(screen.getByText(/© \d{4}.*All rights reserved/)).toBeInTheDocument()
    })
  })

  describe('Navigation Links', () => {
    it('Home link has correct href', () => {
      render(<Footer />)
      
      const homeLink = screen.getByRole('link', { name: 'Home' })
      expect(homeLink).toHaveAttribute('href', '/')
    })

    it('About link has correct href', () => {
      render(<Footer />)
      
      const aboutLink = screen.getByRole('link', { name: 'About' })
      expect(aboutLink).toHaveAttribute('href', '/about')
    })

    it('Contact link has correct href', () => {
      render(<Footer />)
      
      const contactLink = screen.getByRole('link', { name: 'Contact' })
      expect(contactLink).toHaveAttribute('href', '/contact')
    })

    it('links have proper accessibility attributes', () => {
      render(<Footer />)
      
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toBeVisible()
        expect(link).toHaveAttribute('href')
      })
    })
  })

  describe('Copyright', () => {
    it('shows current year dynamically', () => {
      render(<Footer />)
      
      const currentYear = new Date().getFullYear()
      expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument()
    })

    it('displays default company name', () => {
      render(<Footer />)
      
      // Should contain some default company name
      const copyrightText = screen.getByText(/© \d{4}.*All rights reserved/)
      expect(copyrightText).toBeInTheDocument()
      expect(copyrightText.textContent).toMatch(/\w+.*All rights reserved/)
    })

    it('shows custom company name when provided', () => {
      const customCompany = 'Stockholm Places Inc'
      render(<Footer companyName={customCompany} />)
      
      const currentYear = new Date().getFullYear()
      expect(screen.getByText(`© ${currentYear} ${customCompany}. All rights reserved.`)).toBeInTheDocument()
    })
  })

  describe('Layout & Styling', () => {
    it('has correct CSS classes for layout', () => {
      render(<Footer />)
      
      const footer = screen.getByRole('contentinfo')
      expect(footer).toHaveClass('flex', 'justify-between', 'items-center')
    })

    it('has responsive classes applied', () => {
      render(<Footer />)
      
      const footer = screen.getByRole('contentinfo')
      // Should have responsive classes for mobile stacking
      expect(footer).toHaveClass('flex-col', 'md:flex-row')
    })

    it('navigation links container has correct styling', () => {
      render(<Footer />)
      
      // Find the container with navigation links
      const navContainer = screen.getByRole('navigation')
      expect(navContainer).toHaveClass('flex', 'space-x-6')
    })

    it('has proper padding and background', () => {
      render(<Footer />)
      
      const footer = screen.getByRole('contentinfo')
      expect(footer).toHaveClass('p-4', 'bg-gray-50')
    })

    it('links have hover styling classes', () => {
      render(<Footer />)
      
      const homeLink = screen.getByRole('link', { name: 'Home' })
      expect(homeLink).toHaveClass('hover:text-blue-600')
      expect(homeLink).toHaveClass('transition-colors')
    })
  })
})