import React from 'react'

export default function BlogVideoCard() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="[transform-style:preserve-3d] [perspective:1000px]">
          <div className="bg-card text-card-foreground relative rounded-2xl shadow-2xl p-0 [transform:rotateY(-8deg)_rotateX(3deg)] hover:[transform:rotateY(0deg)_rotateX(0deg)] transition-transform duration-500">
            <div className="relative overflow-hidden rounded-2xl">
              <iframe
                className="w-full aspect-video"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"
                title="PTE Strategy Overview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold">Latest Video Guides</h2>
          <p className="text-muted-foreground">
            Watch quick deep-dives on speaking strategies, writing templates, and reading hacks from our instructors.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <a href="/blog" className="border rounded-xl p-4 hover:bg-accent">
              <div className="text-sm font-semibold">Speaking tips</div>
              <div className="text-xs text-muted-foreground">Answer fluency and content</div>
            </a>
            <a href="/blog" className="border rounded-xl p-4 hover:bg-accent">
              <div className="text-sm font-semibold">Writing templates</div>
              <div className="text-xs text-muted-foreground">Summarize written text</div>
            </a>
            <a href="/blog" className="border rounded-xl p-4 hover:bg-accent">
              <div className="text-sm font-semibold">Reading hacks</div>
              <div className="text-xs text-muted-foreground">Fill in the blanks</div>
            </a>
            <a href="/blog" className="border rounded-xl p-4 hover:bg-accent">
              <div className="text-sm font-semibold">Listening practice</div>
              <div className="text-xs text-muted-foreground">Summarize spoken text</div>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}