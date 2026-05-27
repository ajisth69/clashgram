import { type FC, memo } from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';

import type { TabState } from '../../../global/types';

import { getCurrentTabId } from '../../../util/establishMultitabRole';
import { selectTabState } from '../../../global/selectors';
import useLang from '../../../hooks/useLang';

import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

import './LocalModelModal.scss';

export type OwnProps = {
  modal?: TabState['localTranscribeModal'];
};

const LocalModelModal: FC<OwnProps> = ({ modal }) => {
  const { closeLocalTranscribeModal } = getActions();
  const lang = useLang();

  if (!modal || !modal.isOpen) return null;

  const progress = modal.progress || 0;

  return (
    <Modal
      isOpen={Boolean(modal.isOpen)}
      onClose={closeLocalTranscribeModal}
      className="LocalModelModal"
      title="Local AI Model Setup"
    >
      <div className="local-model-modal-content">
        <div className="local-model-icon-wrapper">
          <i className="icon icon-transcribe local-model-icon" />
        </div>
        <p className="local-model-description">
          Downloading the local Speech-to-Text AI model (~140MB) to your browser cache.
          This is a <b>one-time setup</b> to enable fully offline, private voice note transcriptions inside Clashgram.
        </p>
        
        <div className="local-model-progress-container">
          <div className="local-model-progress-bar">
            <div className="local-model-progress-fill" style={`width: ${progress}%`} />
          </div>
          <span className="local-model-progress-percentage">{progress}%</span>
        </div>

        <div className="local-model-footer">
          <Button color="primary" onClick={() => closeLocalTranscribeModal()}>
            Background Download
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): Complete<OwnProps> => {
    const tabId = getCurrentTabId();
    return {
      modal: selectTabState(global, tabId).localTranscribeModal,
    };
  }
)(LocalModelModal));
