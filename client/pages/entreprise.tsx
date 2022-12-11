import React from 'react';
import HomeSection from '../components/home/HomeSection';
import Layout from '../components/layouts/Layout';

const HOME_SECTIONS = [
  {
    title: "Nos frais sont aussi bas que possible. Il n'y a pas de cotisations.",
  },
  {
    title: "Déménager et vivre à l'étranger devient beaucoup plus simple.",
  },
  {
    title: "Faites des achats en ligne dans des boutiques à l'étranger.",
  }
]

const IndexPage = () => {
  return (
    <Layout>
      <div className="w-full">
        {
          HOME_SECTIONS.map((section, index) => (
            <HomeSection section={section} key={index} />
          ))
        }
      </div>
    </Layout>
  );
};

export default IndexPage;

