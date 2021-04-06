import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import Prismic from '@prismicio/client';
import { format, parseISO } from 'date-fns';
import { useMemo } from 'react';
import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const { isFallback } = useRouter();

  const readingTime = useMemo(() => {
    const wordsPerMinute = 200;

    const totalOfWordsContent = post?.data.content.reduce((acc, content) => {
      return (
        acc +
        content.body.reduce((accBody, body) => {
          const textLength = body.text.split(' ').length;

          return accBody + textLength;
        }, 0)
      );
    }, 0);

    return `${Math.ceil(totalOfWordsContent / wordsPerMinute)} min`;
  }, [post]);

  return (
    <>
      <Head>
        <title>
          {isFallback ? 'Carregando post' : post?.data.title} | spacetraveling.
        </title>
      </Head>

      <header className={styles.headerContainer}>
        <Header />
      </header>

      {isFallback ? (
        <p>Carregando...</p>
      ) : (
        <>
          <picture className={styles.banner}>
            <img src={post?.data.banner.url} alt={post?.data.title} />
          </picture>

          <div className={commonStyles.contentContainer}>
            <article className={styles.post}>
              <h1>{post?.data.title}</h1>

              <section className={commonStyles.info}>
                <span>
                  <FiCalendar />
                  {format(
                    parseISO(post.first_publication_date),
                    'dd MMM yyyy'
                  ).toLowerCase()}
                </span>

                <span>
                  <FiUser />
                  {post.data.author}
                </span>

                <span>
                  <FiClock />
                  {readingTime}
                </span>
              </section>

              {post?.data.content.map((content, contentIndex) => (
                <section key={String(`post-content-${contentIndex}`)}>
                  <h3>{content.heading}</h3>
                  {content.body.map((body, bodyIndex) => (
                    <p key={String(`post-content-body-${bodyIndex}`)}>
                      {body.text}
                    </p>
                  ))}
                </section>
              ))}
            </article>
          </div>
        </>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts')
  );

  return {
    paths: posts.results.map(post => ({
      params: { slug: post.uid },
    })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const postResponse = await prismic.getByUID('posts', String(slug), null);

  return {
    props: {
      post: postResponse,
    },
  };
};
