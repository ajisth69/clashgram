import { memo, useState, useEffect } from '../lib/teact/teact';
import BadgeManager from './services/BadgeManager';

// Import the clean SVGs (background removed) directly as asset URLs
import founderSvgUrl from './founder.svg';
import supporterSvgUrl from './supporter.svg';
import betauserSvgUrl from './betauser.svg';
import channelngroupSvgUrl from './channelngroup.svg';

import styles from './ClashgramBadge.module.scss';

// Configuration mapping badge types to clean SVGs and their descriptive titles
const BADGE_CONFIG: Record<string, { url: string; title: string }> = {
  founder: {
    url: founderSvgUrl,
    title: 'Founder',
  },
  supporter: {
    url: supporterSvgUrl,
    title: 'Supporter',
  },
  beta_user: {
    url: betauserSvgUrl,
    title: 'Beta User',
  },
  official_hub: {
    url: channelngroupSvgUrl,
    title: 'Channel & Group',
  },
};

interface BadgeIconProps {
  type: string;
}

/**
 * Individual BadgeIcon component.
 * Renders the clean SVG via a standard <img> tag for optimal performance, browser caching, and zero latency.
 */
const BadgeIcon = memo(({ type }: BadgeIconProps) => {
  const config = BADGE_CONFIG[type];
  if (!config) {
    return null;
  }

  return (
    <div className={styles.badgeWrapper}>
      <img
        src={config.url}
        alt={config.title}
        className={styles.badgeIcon}
        draggable={false}
      />
      <span className={styles.tooltip}>{config.title}</span>
    </div>
  );
});

export interface ClashgramBadgeProps {
  userId?: string | number;
}

/**
 * ClashgramBadge Component: Displays user verification badges inline next to user name blocks.
 */
const ClashgramBadge = ({ userId }: ClashgramBadgeProps) => {
  const [badges, setBadges] = useState<string[]>(() => userId ? BadgeManager.getUserBadges(userId) : []);

  useEffect(() => {
    if (!userId) {
      setBadges([]);
      return undefined;
    }

    // Sync query badges on user ID changes
    setBadges(BadgeManager.getUserBadges(userId));

    // Subscribe to DB update events
    const unsubscribe = BadgeManager.subscribe(() => {
      setBadges(BadgeManager.getUserBadges(userId));
    });

    return unsubscribe;
  }, [userId]);

  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      {badges.map((badgeType) => (
        <BadgeIcon key={badgeType} type={badgeType} />
      ))}
    </div>
  );
};

export default memo(ClashgramBadge);
export { ClashgramBadge };
