'use client';

import { useState } from 'react';
import EssayCard from './cards/EssayCard';
import ReviewCard from './cards/ReviewCard';
import { Essay, Review } from '@/types';

interface AuthorContentProps {
    essays: Essay[];
    reviews: Review[];
}

export default function AuthorContent({ essays, reviews }: AuthorContentProps) {
    const [activeTab, setActiveTab] = useState<'essays' | 'reviews'>('essays');

    return (
        <div>
            <div className="tabs tabs-bordered mb-6">
                <button
                    className={`tab tab-lg ${activeTab === 'essays' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('essays')}
                >
                    Essays ({essays.length})
                </button>
                <button
                    className={`tab tab-lg ${activeTab === 'reviews' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    Reviews ({reviews.length})
                </button>
            </div>

            <div className="space-y-6">
                {activeTab === 'essays' ? (
                    essays.length > 0 ? (
                        essays.map((essay) => (
                            <EssayCard
                                key={essay.id}
                                essay={essay}
                            />
                        ))
                    ) : (
                        <p className="text-base-content/60">No essays yet.</p>
                    )
                ) : (
                    reviews.length > 0 ? (
                        reviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                            />
                        ))
                    ) : (
                        <p className="text-base-content/60">No reviews yet.</p>
                    )
                )}
            </div>
        </div>
    );
} 