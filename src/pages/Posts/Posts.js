import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonPage,
  IonFab,
  IonFabButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonLoading,
  IonCardSubtitle,
  IonModal,
  IonList,
  IonInput,
  IonItem,
  IonButton,
  IonThumbnail,
  IonImg,
  IonTextarea,
  IonRefresher,
  IonRefresherContent,
  IonToast,
} from "@ionic/react";
import { add, closeOutline, camera, trash, send } from "ionicons/icons";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import axios from "axios";
import DataURIToBlob from "../../utils/utils";

const Posts = () => {
  const [image, setImage] = useState(null);
  const [nickname, setNickname] = useState(null);
  const [message, setMessage] = useState(null);
  const [addPostModal, setAddPostModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [toast, setToast] = useState(null);

  const capture = async () => {
    await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 100,
    })
      .then((photo) => {
        setImage(photo);
      })
      .catch(() => {
        setToast("Problem in Capturing Photo");
        setImage(null);
      });
  };
  const dismissAddPostModal = () => {
    setImage(null);
    setMessage(null);
    setNickname(null);
    fetchPosts();
    setAddPostModal(false);
    setLoading(false);
  };

  const submitPost = async () => {
    setLoading(true);
    const imageBlob = DataURIToBlob(image.dataUrl);
    const imageRandomFilename = Math.random().toString(36);
    const dataBlob = JSON.stringify({
      message: message,
      nickname: nickname,
    });
    const data = new FormData();
    data.append("files.image", imageBlob, imageRandomFilename);
    data.append("data", dataBlob);
    await axios
      .post(`https://sourcya-connect.herokuapp.com/posts`, data, {
        header: {
          accept: "application/json",
          "Content-Type": `multipart/form-data;`,
        },
      })
      .catch(() => {
        setToast("Problem in Creating Post");
      });
    dismissAddPostModal();
  };

  const fetchPosts = async (event = undefined) => {
    await axios
      .get(`https://sourcya-connect.herokuapp.com/posts`)
      .then((response) => {
        setPosts(response.data);
      })
      .catch(() => {
        setToast("Problem in Fetching Posts");
      });
    if (event) {
      event.target.complete();
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchPosts();
  }, [posts.length]);

  return (
    <IonPage>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={(event) => fetchPosts(event)}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        {posts.reverse().map((post, index) => (
          <IonCard key={index}>
            <center>
              <img height={"200px"} alt={post.message} src={post.image.url} />
            </center>
            <IonCardContent>
              <IonCardHeader>
                <center>
                  <IonCardSubtitle>{post.nickname}</IonCardSubtitle>
                  <IonCardTitle>{post.message}</IonCardTitle>
                </center>
              </IonCardHeader>
            </IonCardContent>
          </IonCard>
        ))}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton
            onClick={() => {
              setAddPostModal(true);
            }}
          >
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>
        <IonToast
          isOpen={toast}
          onDidDismiss={() => setToast(null)}
          message={toast}
        />
        <IonModal
          isOpen={addPostModal}
          onDidDismiss={() => {
            dismissAddPostModal();
          }}
        >
          <IonList>
            <IonItem lines="none" button>
              <IonIcon
                icon={closeOutline}
                slot="end"
                onClick={() => dismissAddPostModal()}
              />
            </IonItem>
            <IonItem>
              <IonInput
                value={nickname}
                placeholder="Nickname"
                onIonChange={(event) => setNickname(event.detail.value)}
              />
            </IonItem>
            <IonItem>
              <IonTextarea
                rows={6}
                value={message}
                placeholder="Message"
                onIonChange={(event) => setMessage(event.detail.value)}
              />
            </IonItem>
            <IonItem lines="none">
              {!image && (
                <IonButton onClick={() => capture()}>
                  <IonIcon button icon={camera} />
                </IonButton>
              )}
              {image && (
                <>
                  <IonThumbnail>
                    <IonImg src={image.dataUrl} />
                  </IonThumbnail>
                  <IonButton onClick={() => setImage(null)} color="danger">
                    <IonIcon button icon={trash} />
                  </IonButton>
                </>
              )}
            </IonItem>
          </IonList>
          <IonButton
            onClick={() => submitPost()}
            disabled={!nickname || !message || !image}
            size="large"
          >
            <IonIcon button icon={send} />
          </IonButton>
        </IonModal>
        <IonLoading isOpen={loading} spinner={`dots`} />
      </IonContent>
    </IonPage>
  );
};

export default Posts;
