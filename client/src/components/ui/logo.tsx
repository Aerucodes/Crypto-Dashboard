const Logo = () => {
  return (
    <svg
      width="180"
      height="40"
      viewBox="0 0 180 40"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" fillRule="evenodd">
        <path
          d="M40 20c0 11.046-8.954 20-20 20S0 31.046 0 20 8.954 0 20 0s20 8.954 20 20"
          fill="#7289DA"
        />
        <path
          d="M25.5 27.5L20 32l-5.5-4.5m11-15L20 8l-5.5 4.5"
          stroke="#FFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 8v24"
          stroke="#FFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.5 14L20 20l5.5-6M14.5 26L20 20l5.5 6"
          stroke="#FFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <text x="50" y="25" fontFamily="Arial" fontSize="18" fontWeight="bold" fill="#FFFFFF">
        Crypt Dashboard
      </text>
    </svg>
  );
};

export default Logo;