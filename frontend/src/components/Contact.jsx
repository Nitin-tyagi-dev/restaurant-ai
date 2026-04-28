import React from "react";

const Contact = () => {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h1>

      <p className="text-slate-600 mb-6">
        Have questions or want to connect? Fill out the form below 👇
      </p>

      <form className="space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          className="w-full rounded-lg border px-3 py-2"
        />

        <input
          type="email"
          placeholder="Your Email"
          className="w-full rounded-lg border px-3 py-2"
        />

        <textarea
          placeholder="Your Message"
          className="w-full rounded-lg border px-3 py-2"
          rows="4"
        />

        <button
          type="submit"
          className="rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
        >
          Send Message
        </button>
      </form>
    </div>
  );
};

export default Contact;