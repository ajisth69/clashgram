import type { ChangeEvent } from 'react';
import { memo, useState, useRef } from '@teact';
import { getActions, withGlobal } from '../../../global';
import type { ApiPeer } from '../../../api/types';
import type { TabState } from '../../../global/types';
import { selectPeer } from '../../../global/selectors';
import useLang from '../../../hooks/useLang';
import useLastCallback from '../../../hooks/useLastCallback';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Checkbox from '../../ui/Checkbox';
import Select from '../../ui/Select';
import TextArea from '../../ui/TextArea';
import Icon from '../../common/icons/Icon';
import Spinner from '../../ui/Spinner';
import styles from './StoryCreateModal.module.scss';

export type OwnProps = {
  modal: TabState['storyCreateModal'];
};

type StateProps = {
  peer?: ApiPeer;
};

const StoryCreateModal = ({ modal, peer }: OwnProps & StateProps) => {
  const { closeStoryCreateModal, postStory } = getActions();
  const lang = useLang();

  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [privacy, setPrivacy] = useState<'everybody' | 'contacts' | 'nobody'>('everybody');
  const [pinned, setPinned] = useState(true);
  const [period, setPeriod] = useState<number>(86400); // 24 hours in seconds
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>();

  const isOpen = Boolean(modal);

  const handleClose = useLastCallback(() => {
    if (isLoading) return;
    setFile(null);
    setCaption('');
    setPrivacy('everybody');
    setPinned(true);
    setPeriod(86400);
    closeStoryCreateModal();
  });

  const handleFileChange = useLastCallback((e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  });

  const triggerFileSelect = useLastCallback(() => {
    fileInputRef.current?.click();
  });

  const handlePost = useLastCallback(async () => {
    if (!file || !modal?.peerId) return;
    setIsLoading(true);
    try {
      await postStory({
        peerId: modal.peerId,
        file,
        caption,
        privacy,
        pinned,
        period,
      });
      handleClose();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to post story', err);
    } finally {
      setIsLoading(false);
    }
  });

  if (!isOpen) return undefined;

  const isVideo = file?.type.startsWith('video/');
  const previewUrl = file ? URL.createObjectURL(file) : '';

  return (
    <Modal
      isOpen={isOpen}
      className={styles.root}
      contentClassName={styles.content}
      title="Create Story"
      onClose={handleClose}
      hasCloseButton
    >
      <div className={styles.body}>
        {!file ? (
          <div className={styles.uploadArea} onClick={triggerFileSelect}>
            <Icon name="camera" className={styles.uploadIcon} />
            <p>Click to select an Image or Video for your story</p>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,video/*"
              style="display: none"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className={styles.previewContainer}>
            {isVideo ? (
              <video src={previewUrl} controls className={styles.preview} />
            ) : (
              <img src={previewUrl} alt="Preview" className={styles.preview} />
            )}
            <Button
              color="translucent"
              className={styles.removeMediaBtn}
              onClick={() => setFile(null)}
              disabled={isLoading}
              ariaLabel="Remove Media"
            >
              <Icon name="delete" />
            </Button>
            <Button
              color="translucent"
              className={styles.changeMediaBtn}
              onClick={triggerFileSelect}
              disabled={isLoading}
            >
              <Icon name="edit" /> Change Media
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,video/*"
              style="display: none"
              onChange={handleFileChange}
            />
          </div>
        )}

        <div className={styles.form}>
          <TextArea
            label="Caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={isLoading}
            maxLength={1024}
            noReplaceNewlines
          />

          <div className={styles.options}>
            <Select
              id="story-privacy"
              label="Who can see this story?"
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value as any)}
            >
              <option value="everybody">Everybody</option>
              <option value="contacts">Contacts</option>
              <option value="nobody">Only Me</option>
            </Select>

            <Select
              id="story-period"
              label="Story Duration"
              value={String(period)}
              onChange={(e) => setPeriod(Number(e.target.value))}
            >
              <option value="43200">12 Hours</option>
              <option value="86400">24 Hours</option>
              <option value="172800">48 Hours</option>
            </Select>

            <Checkbox
              id="pin-story-checkbox"
              label="Pin Story to Profile"
              checked={pinned}
              onCheck={setPinned}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className={styles.footer}>
          {file ? (
            <Button
              color="secondary"
              onClick={() => setFile(null)}
              disabled={isLoading}
            >
              Back
            </Button>
          ) : (
            <Button
              color="secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handlePost}
            disabled={!file || isLoading}
          >
            {isLoading ? <Spinner color="white" /> : 'Post Story'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { modal }): StateProps => {
    const peer = modal?.peerId ? selectPeer(global, modal.peerId) : undefined;
    return { peer };
  },
)(StoryCreateModal));
