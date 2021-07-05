import React from 'react';
import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Collapse,
  Grid,
  Divider,
  Link,
  CardActionArea,
  Dialog,
  Button,
  TextField,
  InputAdornment,
} from '@material-ui/core';
import {
  MoreVert,
  ExpandMore,
  Favorite,
  Edit,
  Delete,
  Bookmark,
  AccountCircle,
  Schedule,
  VisibilityOff,
  BookmarkBorder,
  FavoriteBorder,
  Share,
} from '@material-ui/icons';
import empty from '../../assets/empty-state-photo.png';
import { format, formatDistance } from 'date-fns';
import { KeywordTags } from './KeywordTags';
import { CheckList } from './Checklist';
import './styles/IdeaCard.scss';
import { connect } from 'react-redux';
import {
  toggleBookmark,
  toggleLike,
} from '../../helpers/kabinetUserInteractions';

function IdeaCard(props) {
  const {
    title,
    description,
    imageURL,
    imageUpload,
    subheader,
    createdAt,
    id,
    history,
    emojiObject,
    deleteCard,
    user,
    ownerId,
    ownerName,
    collection,
    private: hidden,
    bookmarks,
    params,
  } = props;
  const [menu, menuToggle] = React.useState(null);
  const [expanded, expandToggle] = React.useState(false);
  const [likes, setLikes] = React.useState(props.likes || []);
  const [share, shareToggle] = React.useState(false);

  const handleToggle = (e) => {
    menuToggle(Boolean(menu) ? false : e.currentTarget);
    e.stopPropagation();
  };

  const handleToggleShare = (e) => {
    shareToggle(!share);
  };

  const handleToggleLike = async (e) => {
    let newData = likes;
    if (newData.includes(user.uid)) {
      newData = newData.filter((item) => item !== user.uid);
    } else {
      newData = [...newData, user.uid];
    }

    const res = await toggleLike(id, newData);
    if (!res) setLikes(newData);
  };

  const isOwner = user && ownerId === user.uid;

  return (
    <Card className="card-idea">
      <CardHeader
        onClick={() => history.push(`/kabinet-post/${id}`)}
        title={`${emojiObject ? emojiObject.emoji : ''} ${title}`}
        subheader={
          <div className="card-subtitle">
            {!collection && (
              <Typography variant="subtitle1">
                <Link
                  color="primary"
                  className="publisher-link"
                  underline="none"
                  onClick={(e) => {
                    ownerId &&
                      ownerId !== params.uid &&
                      history.push(`/kabinet-user/${ownerId}`);
                    e.stopPropagation();
                  }}
                >
                  <AccountCircle fontSize="small" />
                  <Typography color={isOwner ? 'secondary' : 'primary'}>
                    {ownerName}
                  </Typography>
                </Link>
              </Typography>
            )}
            <Typography variant="subtitle2" className="publish-date">
              {hidden && <VisibilityOff />}
              <Schedule fontSize="small" />
              {/* {format(new Date(createdAt), 'MMM do, yyyy')} */}
              {formatDistance(new Date(createdAt), new Date(), {
                addSuffix: true,
              })}
            </Typography>
          </div>
        }
        action={
          user &&
          user.uid === ownerId && (
            <>
              <IconButton
                aria-label="settings"
                className="header-settings"
                onClick={handleToggle}
              >
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={menu}
                id="simple-menu"
                keepMounted
                open={Boolean(menu)}
                onClose={handleToggle}
                className="menu"
              >
                <MenuItem
                  onClick={(e) => {
                    history.push(`/kabinet-edit/${id}`);
                    e.stopPropagation();
                  }}
                  disabled={id < 5}
                >
                  <Edit fontSize="small" />
                  Edit
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    deleteCard(id);
                    menuToggle(null);
                    e.stopPropagation();
                  }}
                  className="menu-item-delete"
                  disabled={id < 5}
                >
                  <Delete fontSize="small" /> Delete
                </MenuItem>
              </Menu>
            </>
          )
        }
      />
      {imageURL && (
        <>
          <CardActionArea onClick={() => history.push(`/kabinet-post/${id}`)}>
            <CardMedia
              className={!props.singleView ? 'card-img' : ''}
              src={imageURL || imageUpload}
              component="img"
              onError={(e) => (e.target.src = empty)}
            />
          </CardActionArea>
          {/* <ImageDialog
            open={imageOpen}
            title={title}
            imageURL={imageURL}
            onClose={() => setImageOpen(false)}
          /> */}
        </>
      )}
      <CardActions disableSpacing>
        <div className="likes">
          <IconButton
            onClick={handleToggleLike}
            disabled={!user}
            className="like-button"
          >
            {user && likes.includes(user.uid) ? (
              <Favorite />
            ) : (
              <FavoriteBorder />
            )}
          </IconButton>
          {!!likes.length && (
            <Typography variant="body1">{likes.length}</Typography>
          )}
        </div>
        {user && user.uid !== ownerId && (
          <IconButton
            onClick={() => toggleBookmark(id)}
            className="bookmark-button"
          >
            {bookmarks.includes(id) ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>
        )}
        <IconButton
          onClick={handleToggleShare}
          className="share-button"
          color="primary"
        >
          <Share />
        </IconButton>
        <SharableLink open={share} handleClose={handleToggleShare} id={id} />
        <IconButton
          onClick={() => expandToggle(!expanded)}
          className={`expand-button ${expanded ? 'expanded' : ''}`}
        >
          <ExpandMore />
        </IconButton>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <CardContent className="card-content">
          <Grid container direction="column" spacing={1}>
            <Grid item>
              <Typography paragraph>{description}</Typography>
            </Grid>
            {props.keywords && !!props.keywords.length && (
              <Grid item>
                <KeywordTags
                  readOnly
                  keywords={props.keywords}
                  primaryKeyword={props.primaryKeyword}
                />
              </Grid>
            )}
            {props.checklist && !!props.checklist.length && (
              <Grid item>
                <CheckList list={props.checklist} readOnly />
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Collapse>
    </Card>
  );
}

function ImageDialog(props) {
  const { open, onClose, imageURL, title } = props;

  return (
    <Dialog open={open} onClose={onClose}>
      <img src={imageURL} alt={title} />
    </Dialog>
  );
}

function SharableLink(props) {
  const { open, handleClose, id } = props;
  const URL = window.location.origin + '/kabinet-post/' + id;
  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <div className="sharable-link-container">
        <Grid
          container
          spacing={3}
          direction="column"
          justify="center"
          alignItems="center"
        >
          <Grid item>
            <Typography variant="h6">🔗 Sharable link to this post</Typography>
          </Grid>
          <Grid item>
            <TextField label="URL" value={URL} variant="filled" fullWidth />
          </Grid>
          <Grid item>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(URL);
                handleClose();
              }}
              variant="contained"
              color="primary"
              fullWidth
            >
              Copy to Clipboard
            </Button>
          </Grid>
        </Grid>
      </div>
    </Dialog>
  );
}
const mapStateToProps = (state) => {
  return {
    user: state.kabinet_user,
    bookmarks: state.kabinet_bookmarks,
  };
};

export default connect(mapStateToProps)(IdeaCard);
