import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import './Page.css';

const Page = () => {
    const { slug } = useParams();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPage = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/cms/${slug}`);
                setPage(data);

                // Update SEO
                if (data.metaTitle) document.title = data.metaTitle;
                if (data.metaDescription) {
                    let meta = document.querySelector('meta[name="description"]');
                    if (!meta) {
                        meta = document.createElement('meta');
                        meta.name = 'description';
                        document.head.appendChild(meta);
                    }
                    meta.content = data.metaDescription;
                }
            } catch (err) {
                console.error(err);
                setError('Page not found');
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchPage();
    }, [slug]);

    if (loading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;

    if (error || !page) return (
        <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
            <h1>404</h1>
            <p>Page Not Found</p>
        </div>
    );

    return (
        <div className="page-container container">
            <h1 className="page-title">{page.title}</h1>
            <div
                className="page-content"
                dangerouslySetInnerHTML={{ __html: page.content }}
            />
        </div>
    );
};

export default Page;
