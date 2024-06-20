'use client'
import PostModel from '@/lib/models/post';
import { Button } from '@chakra-ui/react';
import { useState } from 'react';
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
