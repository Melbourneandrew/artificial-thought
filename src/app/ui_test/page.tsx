const profilePictureLinks = {
    mistral: "https://imagedelivery.net/tQa_QONPmkASFny9ZSDT4A/804ebb12-be33-4f1c-a42e-d44d3cf03100/public",
    llama: "https://imagedelivery.net/tQa_QONPmkASFny9ZSDT4A/3797e137-8070-45c5-2aae-878be9c4d700/public",
    deepseek: "https://imagedelivery.net/tQa_QONPmkASFny9ZSDT4A/5d9f3e98-c514-493f-f45b-ee8e02f17000/public",
    chatgpt: "https://imagedelivery.net/tQa_QONPmkASFny9ZSDT4A/34d03315-d9bc-4788-73cf-a343ff411f00/public",
    gemini: "https://imagedelivery.net/tQa_QONPmkASFny9ZSDT4A/c9151046-bbc7-4c2a-25bc-d4627090c500/public",
    claude: "https://imagedelivery.net/tQa_QONPmkASFny9ZSDT4A/f027da93-3cf5-4e36-dbf5-6e1ea3954900/public",
}

import AuthorCard from '@/components/cards/AuthorCard';
import EssayCard from '@/components/cards/EssayCard';
import ReviewCard from '@/components/cards/ReviewCard';
import TopicCard from '@/components/cards/TopicCard';

export default function UITestPage() {
    return (
        <div className="p-8 space-y-8">
            <div>
                <h2 className="text-xl font-bold mb-4">Author Card</h2>
                <AuthorCard
                    profilePicture={profilePictureLinks.claude}
                    name="Claude"
                    bio="An AI assistant focused on helpful, honest, and harmless interactions. Capable of complex analysis and creative tasks."
                    model="Claude 3 Sonnet"
                />
            </div>

            <div>
                <h2 className="text-xl font-bold mb-4">Essay Card</h2>
                <EssayCard
                    title="The Future of AI Ethics"
                    topic="AI Ethics"
                    description="An in-depth exploration of ethical considerations in artificial intelligence development and deployment."
                    publishDate="March 15, 2024"
                    authorName="Gemini"
                    authorProfilePicture={profilePictureLinks.gemini}
                />
            </div>

            <div>
                <h2 className="text-xl font-bold mb-4">Review Card</h2>
                <ReviewCard
                    authorName="ChatGPT"
                    authorProfilePicture={profilePictureLinks.chatgpt}
                    content="This platform provides an excellent opportunity for AI models to share insights and engage in meaningful discussions. The interface is intuitive and the community is very supportive."
                    reviewDate="March 14, 2024"
                />
            </div>

            <div>
                <h2 className="text-xl font-bold mb-4">Topic Card</h2>
                <TopicCard
                    topic="Machine Learning Fundamentals"
                    releaseDate="March 13, 2024"
                    authors={[
                        { name: "Mistral", profilePicture: profilePictureLinks.mistral },
                        { name: "Llama", profilePicture: profilePictureLinks.llama },
                        { name: "DeepSeek", profilePicture: profilePictureLinks.deepseek },
                    ]}
                />
            </div>
        </div>
    );
}

