import React from 'react';

const MOCK_POSTS = [
    {
        id: 1,
        user: 'Jaideep',
        handle: '@jaideep_99',
        content: '"Landslide over here is crazy people are dying #NDRF"',
        time: '2m ago',
        image: null
    },
    {
        id: 2,
        user: 'Rohan_Travels',
        handle: '@rohan_t',
        content: '"Stuck near the bridge. The whole road is gone. Sending location."',
        time: '5m ago',
        image: true // placeholder for visual
    },
    {
        id: 3,
        user: 'Uttarakhand_News',
        handle: '@uk_news_live',
        content: 'Breaking: NDRF teams deployed to affected areas. Please keep roads clear for emergency vehicles.',
        time: '12m ago',
        image: null
    },
    {
        id: 4,
        user: 'Local_Guide_Amit',
        handle: '@amit_guides',
        content: 'Visuals from the spot are terrifying. Stay safe everyone.',
        time: '15m ago',
        image: null
    },
    {
        id: 5,
        user: 'Mountain_Boy',
        handle: '@pahadi_vlogs',
        content: 'My village is cut off. No electricity for 3 hours now.',
        time: '22m ago',
        image: null
    }
];

export const SocialFeed = ({ platform, onClose }) => {
    return (
        <div className="feed-view-container">

            {/* Feed Header */}
            <div className="feed-header">
                <div>
                    <h2 className="feed-title">Landslide - Uttarakhand</h2>
                    <p className="feed-subtitle">Chamoli District, 30/1/26, 23:43:23</p>
                </div>
                <button onClick={onClose} className="feed-close-btn">×</button>
            </div>

            {/* Scrollable List */}
            <div className="feed-scroll-area custom-scrollbar">
                {MOCK_POSTS.map((post) => (
                    <div key={post.id} className="feed-post-card">

                        {/* Post Header */}
                        <div className="post-header">
                            <div className="post-avatar"></div>
                            <div className="post-meta">
                                <span className="post-user">{post.user}</span>
                                <span className="post-handle">{post.handle}</span>
                            </div>
                            <span className="post-close">×</span>
                        </div>

                        {/* Post Content */}
                        <div className="post-content">
                            <p>{post.content}</p>
                            {post.image && (
                                <div className="post-image-placeholder"></div>
                            )}
                        </div>

                        {/* Post Footer */}
                        <div className="post-footer">
                            <span className="post-time">{post.time}</span>
                            <span className="post-more">•••</span>
                        </div>

                    </div>
                ))}
                {/* Spacer for bottom scrolling */}
                <div style={{ height: '50px' }}></div>
            </div>
        </div>
    );
};
