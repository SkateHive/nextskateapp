import CommentsList from "@/components/MainFeed/components/CommentsList";
import { useComments } from "@/hooks/comments";
import usePosts from "@/hooks/usePosts";
import React, { useState } from "react"

interface PropDatesProps {
    author: string;
    permlink: string;
}

export function PropDates({ author, permlink }: PropDatesProps) {
    const [visiblePosts, setVisiblePosts] = useState(5);
    const updates = useComments(author, permlink + 'proposal');
    const filteredComments = updates.comments.filter(comment => comment.author === author);

    return (
        <div>
            <CommentsList
                comments={filteredComments}
                visiblePosts={visiblePosts}
                setVisiblePosts={setVisiblePosts}
                username={author}
            />
        </div>
    );
}
