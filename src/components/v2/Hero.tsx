import { motion } from 'framer-motion';
import Trigger from './Trigger';
import { spreadGroup, spreadItem } from './motion';

interface Props {
  onTrigger?: (name: string) => void;
}

export default function Hero({ onTrigger }: Props) {
  return (
    <motion.div
      className="hero"
      variants={spreadGroup}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <h1 className="hero__title">
        <motion.span
          className="hero__greeting"
          variants={spreadItem}
          custom={{ y: -1 }}
        >
          Hi, I&rsquo;m{' '}
          <Trigger name="about" onTrigger={onTrigger}>
            Ems
          </Trigger>
          ,
        </motion.span>
        <motion.span
          className="hero__line"
          variants={spreadItem}
          custom={{ x: -1, y: -0.2 }}
        >
          Full-stack
        </motion.span>
        <motion.span
          className="hero__line"
          variants={spreadItem}
          custom={{ x: 1, y: 0.2 }}
        >
          <Trigger name="work" className="hero__line" onTrigger={onTrigger}>
            Developer
          </Trigger>
        </motion.span>
      </h1>
      <motion.p className="hero__tagline" variants={spreadItem} custom={{ y: 1 }}>
        who{' '}
        <Trigger name="interests" onTrigger={onTrigger}>
          does
        </Trigger>{' '}
        a little bit of everything
      </motion.p>
    </motion.div>
  );
}
