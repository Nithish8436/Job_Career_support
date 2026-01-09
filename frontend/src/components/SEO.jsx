import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
    title,
    description,
    name = 'Career Compass',
    type = 'website'
}) => {
    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{name}</title>
            <meta name='description' content={description} />

            {/* Facebook/Open Graph tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
        </Helmet>
    );
};

export default SEO;
