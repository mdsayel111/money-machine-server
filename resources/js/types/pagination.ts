export type TPagination<T> = {
    data: T[];
    current_page: number;
    from: number | null;
    last_page: number;
    links: { active: boolean; label: string; url: string | null }[];
    next_page_url: string | null;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};
