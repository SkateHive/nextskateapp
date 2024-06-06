'use client'
import { Button } from '@chakra-ui/react';
import React, { useState } from 'react';
import PostModel from '@/lib/models/post';
import { diff_match_patch } from 'diff-match-patch';
import { useMediaQuery } from '@chakra-ui/react';
import { EditModal } from './editMagPostModal';

interface EditButtonProps {
    post: PostModel;
    username: string;
}

export default function EditButton({ post, username }: EditButtonProps) {
    const [isEditing, setIsEditing] = useState(false);


    return (
        <>
            {isEditing && (
                <EditModal
                    isOpen={isEditing}
                    onClose={() => setIsEditing(false)}
                    post={post}
                    username={username}
                />
            )}
            <Button
                colorScheme="red"
                variant="outline"
                onClick={() => { setIsEditing(true); }}
            >
                Edit
            </Button>
        </>
    );
}
