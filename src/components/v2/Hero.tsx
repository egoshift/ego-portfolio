import Trigger from './Trigger';

interface Props {
  onTrigger?: (name: string) => void;
}

export default function Hero({ onTrigger }: Props) {
  return (
    <div className="hero">
      <h1 className="hero__title">
        <span className="hero__greeting">
          Hi, I&rsquo;m{' '}
          <Trigger name="about" onTrigger={onTrigger}>
            Ems
          </Trigger>
          ,
        </span>
        <span className="hero__line">Full-stack</span>
        <Trigger name="work" className="hero__line" onTrigger={onTrigger}>
          Developer
        </Trigger>
      </h1>
      <p className="hero__tagline">
        who{' '}
        <Trigger name="interests" onTrigger={onTrigger}>
          does
        </Trigger>{' '}
        a little bit of everything
      </p>
    </div>
  );
}
