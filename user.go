package user

import (
	"context"
	"log"

	firebase "firebase.google.com/go"
)

// Event Type	Trigger
// onCreate		Triggered when a document is written to for the first time.
// onUpdate		Triggered when a document already exists and has any value changed.
// onDelete		Triggered when a document with data is deleted.
// onWrite	    Triggered when onCreate, onUpdate or onDelete is triggered.

func init() {
	ctx := context.Background()
	// opt := option.WithCredentialsFile("serviceAccount.json")
	// app, err := firebase.NewApp(ctx, nil, opt)

	app, err := firebase.NewApp(ctx, nil)
	if err != nil {
		log.Fatalf("firebase.NewApp: %v", err)
	}

	client, err := app.Firestore(ctx)
	if err != nil {
		log.Fatalf("app.Firestore: %v", err)
	}

	// TODO: add updated from go
	defer client.Close()
}
