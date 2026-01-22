"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { AssetCard } from "@/components/ui/asset-card"
import { ProtocolCardData, ReviewDistribution } from "@/lib/protocol-data"
import { getUserScoreFromTwitter, getReviewsByTwitter } from "@/lib/api/ethos"

interface CardWithEthos extends ProtocolCardData {
  ethosLoading?: boolean
  ethosLoaded?: boolean
}

interface InfiniteScrollCardsProps {
  initialCards: ProtocolCardData[]
  cardsPerPage?: number
}

export function InfiniteScrollCards({ initialCards, cardsPerPage = 15 }: InfiniteScrollCardsProps) {
  const [displayedCards, setDisplayedCards] = useState<CardWithEthos[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)

  // Load initial page
  useEffect(() => {
    const initial = initialCards.slice(0, cardsPerPage).map(card => ({
      ...card,
      ethosLoading: true,
      ethosLoaded: false
    }))
    setDisplayedCards(initial)
    setPage(1)
  }, [initialCards, cardsPerPage])

  // Lazy load Ethos data for newly displayed cards
  useEffect(() => {
    const loadEthosForCards = async () => {
      const cardsNeedingEthos = displayedCards.filter(
        card => card.ethosLoading && !card.ethosLoaded
      )

      if (cardsNeedingEthos.length === 0) return

      // Load Ethos data in sequence to avoid rate limits
      for (const card of cardsNeedingEthos) {
        // Skip if already loaded
        if (card.ethosLoaded) continue

        // Extract Twitter from tags or use a mapping
        const twitterMatch = card.tags?.find(tag => tag.startsWith('@'))
        const twitterUsername = twitterMatch?.substring(1)

        if (!twitterUsername) {
          // Mark as loaded even without Twitter
          setDisplayedCards(prev =>
            prev.map(c =>
              c.name === card.name
                ? { ...c, ethosLoading: false, ethosLoaded: true, ethosScore: 0 }
                : c
            )
          )
          continue
        }

        try {
          // Fetch Ethos score
          const ethosData = await getUserScoreFromTwitter(twitterUsername)
          const ethosScore = ethosData?.score || 0

          // Fetch reviews for distribution
          const reviewsData = await getReviewsByTwitter(twitterUsername, 1000)
          let reviewDistribution: ReviewDistribution = { negative: 0, neutral: 0, positive: 0 }

          if (reviewsData && reviewsData.reviews.length > 0) {
            reviewsData.reviews.forEach((review) => {
              switch (review.reviewScore) {
                case "NEGATIVE":
                  reviewDistribution.negative++
                  break
                case "NEUTRAL":
                  reviewDistribution.neutral++
                  break
                case "POSITIVE":
                  reviewDistribution.positive++
                  break
              }
            })
          }

          // Update card with Ethos data
          setDisplayedCards(prev =>
            prev.map(c =>
              c.name === card.name
                ? {
                    ...c,
                    ethosScore,
                    reviewDistribution,
                    ethosLoading: false,
                    ethosLoaded: true
                  }
                : c
            )
          )

          // Add delay to respect rate limits (1 second between calls)
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          console.error(`Failed to load Ethos for ${card.name}:`, error)
          // Mark as loaded to prevent retry loops
          setDisplayedCards(prev =>
            prev.map(c =>
              c.name === card.name
                ? { ...c, ethosLoading: false, ethosLoaded: true }
                : c
            )
          )
        }
      }
    }

    loadEthosForCards()
  }, [displayedCards])

  // Load more cards when scrolling
  const loadMore = useCallback(() => {
    if (loading) return

    const start = page * cardsPerPage
    const end = start + cardsPerPage

    if (start >= initialCards.length) return

    setLoading(true)

    setTimeout(() => {
      const newCards = initialCards.slice(start, end).map(card => ({
        ...card,
        ethosLoading: true,
        ethosLoaded: false
      }))

      setDisplayedCards(prev => [...prev, ...newCards])
      setPage(prev => prev + 1)
      setLoading(false)
    }, 100)
  }, [page, cardsPerPage, initialCards, loading])

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const target = observerTarget.current
    if (target) {
      observer.observe(target)
    }

    return () => {
      if (target) {
        observer.unobserve(target)
      }
    }
  }, [loadMore, loading])

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedCards.map((card) => (
          <AssetCard
            key={card.name}
            name={card.name}
            avatarUrl={card.avatarUrl}
            ethosScore={card.ethosScore}
            category={card.category}
            tags={card.tags}
            stockMetric={card.stockMetric}
            flowMetric={card.flowMetric}
            reviewDistribution={card.reviewDistribution}
          />
        ))}
      </div>

      {/* Loading indicator and scroll trigger */}
      <div ref={observerTarget} className="py-8 text-center">
        {loading && (
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            <span>Loading more...</span>
          </div>
        )}
        {displayedCards.length >= initialCards.length && (
          <p className="text-slate-500 dark:text-slate-400">
            All {initialCards.length} items loaded
          </p>
        )}
      </div>
    </>
  )
}
