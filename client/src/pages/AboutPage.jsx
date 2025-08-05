import { ThumbsUp, Headphones, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Heading */}
      <h1 className="text-4xl font-bold text-[#00294D] mb-6">Copy Nexus</h1>

      {/* Subheading */}
      <h2 className="text-2xl font-semibold text-[#00294D] mb-4">
        Your trusted source for copiers and supplies
      </h2>

      {/* Description */}
      <p className="text-gray-700 mb-4">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad
        minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
        ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur.
      </p>
      <p className="text-gray-700 mb-12">
        Providing Colombia's businesses with reliable copying solutions for all
        your needs.
      </p>

      {/* Feature Icons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
        {/* Feature 1 */}
        <div>
          <div className="bg-yellow-400 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <ThumbsUp className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-bold text-[#00294D]">Quality Products</h3>
        </div>

        {/* Feature 2 */}
        <div>
          <div className="bg-red-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Headphones className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-bold text-[#00294D]">Excellent Service</h3>
        </div>

        {/* Feature 3 */}
        <div>
          <div className="bg-yellow-400 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-bold text-[#00294D]">Experienced Team</h3>
        </div>
      </div>
    </div>
  );
}
