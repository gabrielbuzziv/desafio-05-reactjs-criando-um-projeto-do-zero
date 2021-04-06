import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { FiCalendar, FiUser } from 'react-icons/fi';

import Prismic from '@prismicio/client';
import { parseISO, format } from 'date-fns';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import Header from '../components/Header';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

const PAGE_SIZE = 2;

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  function loadMorePosts() {
    fetch(nextPage)
      .then(response => response.json())
      .then(response => {
        setPosts([...posts, ...response.results]);
        setNextPage(response.next_page);
      });
  }

  return (
    <>
      <Head>
        <title>spacetraveling.</title>
      </Head>

      <div className={commonStyles.contentContainer}>
        <div className={styles.headerContainer}>
          <Header />
        </div>

        <main>
          {posts.map(post => (
            <div key={post.uid} className={styles.post}>
              <Link href={`/post/${post.uid}`}>
                <h2>{post.data.title}</h2>
              </Link>
              <p>{post.data.subtitle}</p>

              <footer className={commonStyles.info}>
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
              </footer>
            </div>
          ))}

          {!!nextPage && (
            <button
              type="button"
              className={styles.loadMore}
              onClick={loadMorePosts}
            >
              Carregar mais posts
            </button>
          )}
        </main>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      pageSize: PAGE_SIZE,
      page: 1,
    }
  );

  return {
    props: {
      postsPagination: {
        ...postsResponse,
        results: postsResponse.results,
      },
    },
  };
};
