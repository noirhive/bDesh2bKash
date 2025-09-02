export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-6 mt-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © {currentYear}{' '}
          <a 
            href="https://bdesh2bkash.vercel.app/" 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            bDesh2bKash
          </a>
          . Built with ❤️ by{' '}
          <a 
            href="https://shahriar.rf.gd/" 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Shahriar
          </a>
        </p>
      </div>
    </footer>
  )
}

