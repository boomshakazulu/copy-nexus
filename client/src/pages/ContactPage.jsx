export default function ContactPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* <!-- Left side --> */}
      <div>
        <h2 className="text-3xl font-semibold mb-2">Get in touch with us</h2>
        <p className="text-gray-600 mb-8">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>

        {/* <!-- Address --> */}
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-yellow-400 p-2 rounded-full">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.22-2.25 6.2-5 9.88C9.25 15.2 7 11.22 7 9z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-[#00294D]">Address</h3>
            <p className="text-gray-700">123 Main St, Bogotá</p>
          </div>
        </div>

        {/* <!-- Phone --> */}
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-red-500 p-2 rounded-full">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1.003 1.003 0 011.11-.21c1.2.49 2.51.76 3.86.76.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.29 21 3 13.71 3 5c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.35.26 2.66.76 3.86.15.37.06.8-.21 1.11l-2.43 2.43z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-[#00294D]">Phone</h3>
            <p className="text-gray-700">+57 123 4567880</p>
          </div>
        </div>

        {/* <!-- Email --> */}
        <div className="flex items-start gap-4">
          <div className="bg-yellow-400 p-2 rounded-full">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4.99l-8 5.01-8-5.01V6l8 5 8-5v2.99z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-[#00294D]">Email</h3>
            <p className="text-gray-700">info@copynexus.co</p>
          </div>
        </div>
      </div>

      {/* <!-- Right side (Form) --> */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold mb-6 text-[#00294D]">
          Contact Form
        </h3>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              rows="4"
              className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-red-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-red-600 transition"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
