import { memo, useState, useEffect, createContext, useCallback } from '../lib/teact/teact';
import type { TeactNode } from '../lib/teact/teact';
import useContext from '../hooks/data/useContext';
import { getActions } from '../global';

import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

import clashgramLogoUrl from '../assets/clashgram-logo.svg';

import styles from './ClashgramBadge.module.scss';

// Configuration mapping badge types to the Clashgram logo
const BADGE_CONFIG: Record<string, { url: string; title: string }> = {
  founder: {
    url: clashgramLogoUrl,
    title: 'Founder',
  },
  supporter: {
    url: clashgramLogoUrl,
    title: 'Supporter',
  },
  beta_user: {
    url: clashgramLogoUrl,
    title: 'Beta User',
  },
  official_hub: {
    url: clashgramLogoUrl,
    title: 'Channel & Group',
  },
};

interface BadgeIconProps {
  type: string;
  userName?: string;
  userId?: string | number;
}

const BadgeIcon = memo(({ type, userName, userId }: BadgeIconProps) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLearnMoreOpen, setLearnMoreOpen] = useState(false);

  const config = BADGE_CONFIG[type];
  if (!config) {
    return null;
  }

  const handleOpen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setModalOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setModalOpen(false);
    setLearnMoreOpen(false);
  }, []);

  const toggleLearnMore = useCallback(() => {
    setLearnMoreOpen((prev) => !prev);
  }, []);

  const handleMentionClick = useCallback((e: React.MouseEvent, username: string) => {
    e.preventDefault();
    e.stopPropagation();
    getActions().openChatByUsername({ username });
    handleClose();
  }, [handleClose]);

  let roleName = '';
  if (type === 'founder') roleName = 'a core founder';
  else if (type === 'beta_user') roleName = 'a beta user';
  else if (type === 'supporter') roleName = 'a supporter';
  else if (type === 'official_hub') roleName = 'an official group/channel';
  else roleName = 'a member';

  return (
    <>
      <div className={styles.badgeWrapper} onClick={handleOpen}>
        <img
          src={config.url}
          alt={config.title}
          className={styles.badgeIcon}
          draggable={false}
        />
        <span className={styles.tooltip}>{config.title}</span>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        hasCloseButton
        title="Clashgram Badge"
      >
        <div className={styles.modalContent}>
          <p className={styles.modalMessage}>
            <a href={userId ? `tg://user?id=${userId}` : undefined} className={styles.mentionLink}>
              <strong>{userName || 'User'}</strong>
            </a>{' '}
            is {roleName} of clashgram.
          </p>
          {!isLearnMoreOpen ? (
            <Button size="smaller" ripple onClick={toggleLearnMore}>
              Learn more
            </Button>
          ) : (
            <div className={styles.learnMoreContent}>
              <p>Clashgram badges recognize active and dedicated members of our community.</p>
              <p>To request a badge for your profile, please ping <a className={styles.mentionLink} onClick={(e) => handleMentionClick(e, 'letmesolo_her')}>@letmesolo_her</a> directly, or reach out to an admin or owner in the official <a className={styles.mentionLink} onClick={(e) => handleMentionClick(e, 'clashgramchat')}>@clashgramchat</a>.</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
});

export const BadgeContext = createContext<Record<string, string[]>>({});

export const BadgeProvider = ({ children }: { children: TeactNode }) => {
  const [database, setDatabase] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const response = await fetch('https://badge-engine.clashgram.workers.dev/api/user-badges/database');
        const data = await response.json();
        if (data) {
          if (data.success && data.database) {
            setDatabase(data.database);
          } else {
            setDatabase(data);
          }
        }
      } catch (error) {
        console.error('[BadgeProvider] Failed to fetch badge database:', error);
      }
    };
    fetchBadges();
  }, []);

  return (
    <BadgeContext.Provider value={database}>
      {children}
    </BadgeContext.Provider>
  );
};

export interface ClashgramBadgeProps {
  userId?: string | number;
  userName?: string;
}

/**
 * ClashgramBadge Component: Displays user verification badges inline next to user name blocks.
 */
const ClashgramBadge = ({ userId, userName }: ClashgramBadgeProps) => {
  const database = useContext(BadgeContext);

  if (!database || !userId) {
    return null;
  }

  const userBadges = database[String(userId)];
  if (!userBadges || userBadges.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      {userBadges.map((badgeType) => (
        <BadgeIcon key={badgeType} type={badgeType} userName={userName} />
      ))}
    </div>
  );
};

export default memo(ClashgramBadge);
export { ClashgramBadge };
