export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 text-sm">
              &copy; {currentYear} PapiKos. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-teal-600 text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-gray-600 hover:text-teal-600 text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-600 hover:text-teal-600 text-sm">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
