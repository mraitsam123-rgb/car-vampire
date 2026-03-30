export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white border rounded-xl p-8 shadow-sm space-y-8">
        <section className="space-y-4">
          <h1 className="text-4xl font-black text-indigo-900 uppercase italic">About Us</h1>
          <p className="text-xl font-bold text-gray-800 italic">Welcome to QuickBuy, your fast, reliable, and convenient online marketplace!</p>
          <p className="text-gray-600 leading-relaxed">
            At QuickBuy, we believe buying and selling should be simple, safe, and quick. Whether you’re looking for a great deal or want to sell items you no longer need, our platform connects buyers and sellers effortlessly.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-[#002f34] uppercase italic border-b-2 border-indigo-900 pb-1 inline-block">Why Choose QuickBuy?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <h3 className="font-black text-indigo-900 uppercase text-sm">Easy & Fast</h3>
              <p className="text-gray-600 text-sm">List your items or find what you need in minutes.</p>
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-indigo-900 uppercase text-sm">Public Marketplace</h3>
              <p className="text-gray-600 text-sm">A platform where diverse sellers upload a wide variety of products.</p>
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-indigo-900 uppercase text-sm">Secure & Transparent</h3>
              <p className="text-gray-600 text-sm">While QuickBuy facilitates the connection, we remind users to confirm before purchasing as all transactions are between buyers and sellers.</p>
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-indigo-900 uppercase text-sm">Customer Focused</h3>
              <p className="text-gray-600 text-sm">Designed to give you a smooth and attractive shopping experience.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <p className="text-gray-600 leading-relaxed italic font-medium">
            Our mission is to empower people to buy and sell with confidence, making online shopping convenient for everyone.
          </p>
        </section>

        <section className="pt-8 border-t border-gray-100 grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h2 className="text-xl font-black text-indigo-900 uppercase italic">Developer Info</h2>
            <div className="space-y-1 text-sm">
              <p className="text-gray-800 font-bold">Syed Aitsam Shah</p>
              <p className="text-gray-600">Student of Software Engineering</p>
              <p className="text-gray-600 font-medium">COMSATS University Islamabad</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-xl font-black text-indigo-900 uppercase italic">Connect with us</h2>
            <div className="space-y-1 text-sm font-bold">
              <p className="text-[#002f34] flex items-center gap-2">
                <span>📧</span> <a href="mailto:fa25-bse-015@cuiatk.edu.pk" className="hover:text-indigo-600 transition">fa25-bse-015@cuiatk.edu.pk</a>
              </p>
              <p className="text-[#002f34] flex items-center gap-2">
                <span>📞</span> <a href="tel:03339164417" className="hover:text-indigo-600 transition">03339164417</a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
