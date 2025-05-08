export type TechType = {
  logo: string,
  name: string
} 
export const Techs: Record<string, TechType> = {
  "html": {
    logo: "tech/html.png",
    name: "HTML"
  },
  "css": {
    logo: "tech/css.png",
    name: "CSS",
  },
  "js": {
    logo: "tech/js.png",
    name: "JS",
  },
  "ts": {
    logo: "tech/ts.png",
    name: "Typescript",
  },
  "react": {
    logo: "tech/react.png",
    name: "React",
  },
  "nx": {
    logo: "tech/nx.png",
    name: "Nx",
  },
  "nestjs": {
    logo: "tech/nestjs.png",
    name: "NestJS",
  },
  "nextjs": {
    logo: "tech/nextjs.png",
    name: "NextJS",
  },
  "postgresql": {
    logo: "tech/postgresql.png",
    name: "PostgreSQL",
  },
  "tailwindcss": {
    logo: "tech/tailwindcss.png",
    name: "TailwindCSS",
  },
  "mui": {
    logo: "tech/mui.png",
    name: "MaterialUI",
  },
  "php": {
    logo: "tech/php.png",
    name: "PHP",
  },
  "laravel": {
    logo: "tech/laravel.png",
    name: "Laravel",
  },
  "code-igniter": {
    logo: "tech/code-igniter.png",
    name: "Code Igniter",
  },
  "jquery": {
    logo: "tech/jquery.png",
    name: "jQuery",
  },
  "bootstrap": {
    logo: "tech/bootstrap.png",
    name: "Bootstrap",
  },
  "mysql": {
    logo: "tech/mysql.png",
    name: "MySQL",
  },
}

export const Professional = [
  {
    name: 'Symph',
    role: 'Full-stack Developer',
    timeline: 'October 2020 - present',
    techstack: ["html", "css", "js", "react", "ts", "nx", "nestjs", "nextjs", "postgresql", "tailwindcss"],
    responsibilites: [
      "Solely developed a complex, enterprise-level sustainability platform using React, NestJS, NX, and GCP, which automated the parsing of diverse monthly data inputs, generated detailed company and subsidiary-level ESG reports, and provided real-time performance tracking and dashboard visualizations.",
      "Transitioned a same-day/next-day, inter-island delivery system within the Philippines from a legacy Python/Flask system on GCP to a modern React/NestJS/GCP platform, implementing admin operations, rider/customer applications, and integrated payment gateways",
      "Designed integral aspects of a consolidated digital ID for a large emerging healthcare application within the Philippines using React/React-Native, NestJS, and GCP focused on solid authentication and verification, all under a microservices architecture.",
      "Contributed to the frontend modernization of a Stockholm-based digital content production and distribution platform, transitioning key UI components from legacy systems to enhance user experience and performance.",
      "Supported company software product-producing initiatives by developing automated web monitoring tools for data acquisition, automatic invoice application, and others.",
      "Contributed to the development of AI-powered lesson planning application.",
      "Utilized the OpenAI API, n8n, and AirOps for AI-driven features.",
      "Utilized Google Cloud Platform for deploying and managing applications.",
      "Conducted code reviews to maintain code quality and compliance with project requirements.",
      "Mentored interns and junior developers to guide and share knowledge to support their professional growth.",
    ],
    projects: [
      {
        title: "Sustainability Platform",
        description: "This enterprise-grade sustainability platform automates the complex task of analyzing and reporting on ESG data. It takes in diverse monthly data streams and transforms them into detailed, company-wide and subsidiary-specific ESG reports. The application also features real-time performance monitoring and engaging dashboard visualizations, providing a clear and up-to-date view of sustainability progress across the entire organization.",
        isNDA: true,
        techstack: [
          "html", "css", "js", "react", "ts", "nx", "nestjs", "nextjs", "postgresql", "tailwindcss"
        ],
      },
      {
        title: "Same-day, Next-day Inter-Island Shipment",
        description: "This enhanced delivery system streamlines same-day and next-day inter-island shipping throughout the Philippines. It offers intuitive applications for both riders and customers, robust administrative functionalities, and integrated payment processing, providing a smoother and more efficient delivery experience for all users.",
        isNDA: true,
        techstack: [
          "html", "css", "js", "react", "ts", "nx", "nestjs", "nextjs", "tailwindcss"
        ],
      },
      {
        title: "Asset Management and Content Adaptation",
        description: "This Stockholm-developed digital content platform offers an intelligent solution for managing the entire content lifecycle, from creation to distribution. Embedded AI capabilities provide valuable assistance in various stages, enhancing productivity and content effectiveness. Moreover, the platform excels in managing digital assets for multilingual markets, offering features for organizing, localizing, and distributing content in multiple languages, facilitating effective engagement with a global audience.",
        isNDA: true,
        techstack: [
          "html", "css", "js", "react", "ts", "nx", "nestjs", "nextjs", "mui"
        ],
      }
    ]
  },
  {
    name: 'True North Group of Companies',
    role: 'Full-stack Developer',
    timeline: 'June 2018 - September 2020',
    techstack: ["html", "css", "js", "php", "code-igniter", "laravel", "bootstrap", "jquery", "mysql"],
    responsibilites: [
      "Developed a centralized yearly budget system utilizing PHP/Laravel, and MySQL for multiple companies in a shared services model.",
      "Designed and developed an end-to-end financial statements application using PHP/Laravel, and MySQL, parsing and consolidating data automatically for expense tracking, invoicing, and payroll invarious companies.",
      "Developed and constructed an assets inventory system using PHP/Laravel, and MySQL that offers multi-company tracking of assets, stock, and depreciation values as a common service.",
      "Setup and managed company server.",
      "Developed a custom tabulation application using PHP/Laravel, Websockets, and NoSQL for automated real-time event scoring as a shared service for sponsored events.",
      "Created a student enrollment and balance monitoring application with SMS reminders using PHP/Laravel, and MySQL, offering a common service for schools.",
      "Reviewed manual processes across shared departments to pinpoint areas for enhancement and potential automation opportunities.",
      "Created and executed development plans to automate or integrate current processes, significantly improving workflow efficiency.",
      "Automated processes within the company's finance and human resources department, streamlining workflows and reducing manual effort.",
    ],
  }
]