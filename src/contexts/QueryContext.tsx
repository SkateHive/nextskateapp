import { createContext, useContext } from 'react';
import usePosts from '@/hooks/usePosts';
import { Discussion } from '@hiveio/dhive';

interface QueryContextProps {
    posts: Discussion[] | null | undefined;
    isLoading: boolean;
    error: any;
}

const QueryContext = createContext<QueryContextProps | undefined>(undefined);

export const QueryProvider = ({ children, query, tag }: { children: React.ReactNode; query: string; tag: { tag: string; limit: number }[] }) => {
    const { posts, error, isLoading } = usePosts(query, tag);

    return (
        <QueryContext.Provider value={{ posts, isLoading, error }}>
            {children}
        </QueryContext.Provider>
    );
};

export const useQueryResult = () => {
    const context = useContext(QueryContext);
    if (!context) {
        throw new Error('useQueryResult must be used within a QueryProvider');
    }
    return context;
};
