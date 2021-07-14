const _ = require("lodash");
const { Path } = require("path-parser");
const { URL } = require("url");
const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const requireCredits = require("../middlewares/requireCredits");
const Mailer = require("../services/Mailer");
const surveyTemplate = require("../services/emailTemplates/surveyTemplate");
const Survey = mongoose.model("surveys");

module.exports = (app) => {
  app.get("/api/surveys", requireLogin, async (req, res) => {
    const surveys = await Survey.find({ _user: req.user.id })
      .select({
        recipients: false,
      })
      .sort({ dateSent: -1, lastResponded: -1 });
    res.send(surveys);
  });

  app.get("/api/surveys/:surveyId/:choice", async (req, res) => {
    const surveyId = req.params.surveyId;
    const choice = req.params.choice;
    console.log(surveyId, choice);
    const surveytemp = await Survey.findOne({
      _id: surveyId,
    });
    if (choice == "Yes") {
      surveytemp.yes++;
    } else if (choice == "No") {
      surveytemp.no++;
    }
    surveytemp.lastResponded = new Date();
    surveytemp.recipients[0].responded = true;
    await surveytemp.save();
    res.send("<h1>Thanks for the feedback!</h1>");
  });

  app.post("/api/surveys/webhooks", (req, res) => {
    const p = new Path("/api/surveys/:surveyId/:choice");
    console.log(req.body);
    _.chain(req.body)
      .map(({ email, url }) => {
        const match = p.test(new URL(url).pathname);
        if (match) {
          return { email, surveyId: match.surveyId, choice: match.choice };
        }
      })
      .compact()
      .uniqBy("email", "surveyId")
      .each(({ surveyId, email, choice }) => {
        Survey.updateOne(
          {
            _id: surveyId,
            recipients: {
              $elemMatch: { email: email },
            },
          },
          {
            $inc: { [choice]: 1 }, // ES6 key interpolation
            $set: { "recipients.$.responded": true },
            lastResponded: new Date(),
          }
        ).exec();
      })
      .value();

    // This below code can be written as above using chain helper from lodash
    // const events = _.map(req.body, ({ email, url }) => {
    //     const match = p.test(new URL(url).pathname);
    //     if(match) {
    //         return { email, surveyId: match.surveyId, choice: match.choice }
    //     }
    // });

    // const compactEvents = _.compact(events);
    // const uniqueEvents = _.uniqBy(compactEvents, 'email', 'surveyId');

    res.send({});
  });

  app.post("/api/surveys", requireLogin, requireCredits, async (req, res) => {
    const { title, subject, body, recipients } = req.body;

    const survey = new Survey({
      title: title,
      subject: subject,
      body: body,
      recipients: recipients
        .split(",")
        .map((email) => ({ email: email.trim() })),
      // there still might be some trailing or white spaces on each email.
      _user: req.user.id,
      dateSent: Date.now(),
    });

    const mailer = new Mailer(survey, surveyTemplate(survey));
    try {
      await mailer.send();
      await survey.save();
      req.user.credits -= 1;
      const user = await req.user.save();

      res.send(user);
    } catch (err) {
      res.status(422).send(err);
    }
  });
};
