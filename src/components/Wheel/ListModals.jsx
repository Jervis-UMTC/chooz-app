
import { AnimatePresence } from 'framer-motion';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { CloseIcon } from '../common/Icons';
import {
  ModalOverlay,
  Modal,
  ModalTitle,
  NameItem,
  RemoveButton,
  EmptyState,
  ButtonRow,
  IconButton,
} from './Controls.styles';

/**
 * Modal dialog for saving the current name list with a custom label.
 * @param {object} props
 * @param {string} props.listName - Current value of the list name input.
 * @param {function} props.onListNameChange - Setter for the list name input.
 * @param {function} props.onSave - Handler invoked when the user confirms save.
 * @param {function} props.onClose - Handler to dismiss the modal.
 */
export const SaveModal = ({ listName, onListNameChange, onSave, onClose }) => (
  <AnimatePresence>
    <ModalOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <Modal
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={event => event.stopPropagation()}
      >
        <ModalTitle>Save List</ModalTitle>
        <Input
          value={listName}
          onChange={(event) => onListNameChange(event.target.value)}
          placeholder="List name..."
          style={{ marginBottom: 12 }}
        />
        <ButtonRow>
          <Button onClick={onSave} style={{ flex: 1 }}>Save</Button>
          <IconButton onClick={onClose}>
            <CloseIcon size={14} />
          </IconButton>
        </ButtonRow>
      </Modal>
    </ModalOverlay>
  </AnimatePresence>
);

/**
 * Modal dialog for loading or deleting previously saved name lists.
 * @param {object} props
 * @param {Array} props.savedLists - Array of saved list objects.
 * @param {function} props.onLoad - Handler invoked with the selected list.
 * @param {function} props.onDelete - Handler invoked with the list to remove.
 * @param {function} props.onClose - Handler to dismiss the modal.
 */
export const LoadModal = ({ savedLists, onLoad, onDelete, onClose }) => (
  <AnimatePresence>
    <ModalOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <Modal
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={event => event.stopPropagation()}
      >
        <ModalTitle>Load List</ModalTitle>
        {savedLists.length === 0 ? (
          <EmptyState>No saved lists yet.</EmptyState>
        ) : (
          savedLists.map((list, index) => (
            <NameItem key={index} style={{ marginBottom: 8 }}>
              <span onClick={() => onLoad(list)} style={{ cursor: 'pointer', flex: 1 }}>
                {list.name} ({list.names.length})
              </span>
              <RemoveButton onClick={() => onDelete(list)} title="Delete">
                <CloseIcon size={10} />
              </RemoveButton>
            </NameItem>
          ))
        )}
        <IconButton onClick={onClose} style={{ marginTop: 8 }}>
          <CloseIcon size={14} />
        </IconButton>
      </Modal>
    </ModalOverlay>
  </AnimatePresence>
);
