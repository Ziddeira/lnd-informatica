import { ExternalLink, Quote, Star } from "lucide-react";
import { COMPANY } from "@/data/company";
import { REVIEWS, type Review } from "@/data/reviews";

function Stars({ value, className = "h-4 w-4" }: { value: number; className?: string }) {
  return (
    <span className="flex gap-0.5" aria-label={`${value} de 5 estrelas`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`${className} ${i < Math.round(value) ? "fill-amber-400 text-amber-400" : "text-slate-600"}`} />
      ))}
    </span>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="relative w-[300px] shrink-0 rounded-2xl border border-white/8 bg-panel-2/70 p-5 sm:w-[360px]">
      <Quote className="absolute right-4 top-4 h-6 w-6 text-white/5" />
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand/30 to-accent/30 text-sm font-bold text-white">
          {review.initials}
        </span>
        <div>
          <figcaption className="text-sm font-semibold text-white">{review.author}</figcaption>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Stars value={review.rating} className="h-3 w-3" /> {review.when}
          </div>
        </div>
      </div>
      <blockquote className="text-sm leading-relaxed text-slate-300">“{review.text}”</blockquote>
      <span className="mt-3 inline-block rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-medium text-brand">{review.service}</span>
    </figure>
  );
}

function MarqueeRow({ reviews, reverse = false }: { reviews: Review[]; reverse?: boolean }) {
  // Lista duplicada para o loop contínuo (a animação desloca -50%)
  return (
    <div className="group flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <div
        className={`flex w-max gap-4 pr-4 group-hover:[animation-play-state:paused] ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
      >
        {[...reviews, ...reviews].map((review, i) => (
          <ReviewCard key={i} review={review} />
        ))}
      </div>
    </div>
  );
}

export default function ReviewsSection() {
  const half = Math.ceil(REVIEWS.length / 2);
  return (
    <section id="avaliacoes" className="relative overflow-hidden py-20 sm:py-28" aria-labelledby="reviews-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand">Prova social</p>
            <h2 id="reviews-title" className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Quase 5.000 clientes já avaliaram. <span className="text-gradient">A nota fala por nós.</span>
            </h2>
          </div>

          <div className="flex items-center gap-5 rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-xl shadow-black/30">
            <div className="text-center">
              <p className="font-display text-5xl font-bold text-white">{COMPANY.rating.toFixed(1).replace(".", ",")}</p>
              <p className="text-xs text-slate-500">de 5</p>
            </div>
            <div className="space-y-1.5">
              <Stars value={COMPANY.rating} className="h-5 w-5" />
              <p className="text-sm text-slate-300">
                <strong className="text-white">{COMPANY.reviewCountLabel}</strong> avaliações no Google
              </p>
              <a
                href={COMPANY.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
              >
                Ver no Google Maps <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <MarqueeRow reviews={REVIEWS.slice(0, half)} />
        <MarqueeRow reviews={REVIEWS.slice(half)} reverse />
      </div>
    </section>
  );
}
