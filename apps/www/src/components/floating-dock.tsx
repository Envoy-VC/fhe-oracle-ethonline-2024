/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 **/
import Image from 'next/image';
import Link from 'next/link';

import { useRef, useState } from 'react';

import { cn } from '~/lib/utils';

import {
  AnimatePresence,
  type MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import Logo from 'public/icon.svg';

import {
  FlaskConicalIcon,
  GithubIcon,
  HouseIcon,
  LayoutPanelTop,
  PanelTopCloseIcon,
  SparkleIcon,
  TableOfContentsIcon,
} from 'lucide-react';

const FloatingDockComponent = ({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockDesktop className={desktopClassName} items={items} />
      <FloatingDockMobile className={mobileClassName} items={items} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn('relative block md:hidden', className)}>
      <AnimatePresence>
        {open ? (
          <motion.div
            className='absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2'
            layoutId='nav'
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    delay: idx * 0.05,
                  },
                }}
              >
                <Link
                  key={item.title}
                  className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-900'
                  href={item.href}
                >
                  <div className='h-4 w-4'>{item.icon}</div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
      <button
        className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-800'
        type='button'
        onClick={() => setOpen(!open)}
      >
        <PanelTopCloseIcon className='h-5 w-5 text-neutral-500 dark:text-neutral-400' />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
}) => {
  const mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      className={cn(
        'mx-auto hidden h-16 items-end gap-4 rounded-2xl bg-gray-50 px-4 pb-3 dark:bg-neutral-900 md:flex',
        className
      )}
      onMouseLeave={() => mouseX.set(Infinity)}
      onMouseMove={(e) => mouseX.set(e.pageX)}
    >
      {items.map((item) => (
        <IconContainer key={item.title} mouseX={mouseX} {...item} />
      ))}
    </motion.div>
  );
};

const IconContainer = ({
  mouseX,
  title,
  icon,
  href,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [40, 60, 40]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 60, 40]);

  const widthTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 25, 20]
  );
  const heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 25, 20]
  );

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <Link href={href}>
      <motion.div
        ref={ref}
        className='relative flex aspect-square items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-800'
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <AnimatePresence>
          {hovered ? (
            <motion.div
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              className='absolute -top-8 left-1/2 w-fit -translate-x-1/2 whitespace-pre rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white'
              exit={{ opacity: 0, y: 2, x: '-50%' }}
              initial={{ opacity: 0, y: 10, x: '-50%' }}
            >
              {title}
            </motion.div>
          ) : null}
        </AnimatePresence>
        <motion.div
          className='flex items-center justify-center'
          style={{ width: widthIcon, height: heightIcon }}
        >
          {icon}
        </motion.div>
      </motion.div>
    </Link>
  );
};

export const FloatingDock = () => {
  const links = [
    {
      title: 'Home',
      icon: (
        <HouseIcon className='h-full w-full text-neutral-500 dark:text-neutral-300' />
      ),
      href: '#',
    },

    {
      title: 'Features',
      icon: (
        <SparkleIcon className='h-full w-full text-neutral-500 dark:text-neutral-300' />
      ),
      href: '#features',
    },
    {
      title: 'Architecture',
      icon: (
        <LayoutPanelTop className='h-full w-full text-neutral-500 dark:text-neutral-300' />
      ),
      href: '#architecture',
    },
    {
      title: 'FHE Oracle',
      icon: (
        <Image
          alt='FHE Oracle Logo'
          height={32}
          src={Logo as unknown as string}
          width={32}
        />
      ),
      href: '#',
    },
    {
      title: 'Solutions',
      icon: (
        <FlaskConicalIcon className='h-full w-full text-neutral-500 dark:text-neutral-300' />
      ),
      href: '#solutions',
    },

    {
      title: 'FAQ',
      icon: (
        <TableOfContentsIcon className='h-full w-full text-neutral-500 dark:text-neutral-300' />
      ),
      href: '#faq',
    },
    {
      title: 'GitHub',
      icon: (
        <GithubIcon className='h-full w-full text-neutral-500 dark:text-neutral-300' />
      ),
      href: 'https://github.com/Envoy-VC/fhe-oracle-ethonline-2024',
    },
  ];
  return (
    <div className='dark fixed bottom-12 flex w-full items-center justify-center'>
      <FloatingDockComponent items={links} />
    </div>
  );
};
