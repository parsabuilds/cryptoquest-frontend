// src/components/Quiz.js

import React, { useState } from 'react';
import { questions } from '../data/questions';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  LinearProgress,
} from '@mui/material';


function Quiz({ onQuizComplete, onMilestoneReached }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const handleAnswerOptionClick = (selectedOption) => {
    const currentQuestion = questions[currentQuestionIndex];
    let newCorrectAnswers = correctAnswers;

    if (selectedOption === currentQuestion.answer) {
      newCorrectAnswers += 1;
      setCorrectAnswers(newCorrectAnswers);
    }

    // Check for milestones
    if (
      newCorrectAnswers === 10 ||
      newCorrectAnswers === 20 ||
      newCorrectAnswers === 25
    ) {
      onMilestoneReached(newCorrectAnswers);
    }

    const nextQuestionIndex = currentQuestionIndex + 1;

    if (nextQuestionIndex < questions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      onQuizComplete(newCorrectAnswers);
    }
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

   return (
    <Box>
      <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {questions[currentQuestionIndex].question}
          </Typography>
          <Grid container spacing={2}>
            {questions[currentQuestionIndex].options.map((option) => (
              <Grid item xs={12} sm={6} key={option}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleAnswerOptionClick(option)}
                >
                  {option}
                </Button>
              </Grid>
            ))}
          </Grid>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Quiz;
