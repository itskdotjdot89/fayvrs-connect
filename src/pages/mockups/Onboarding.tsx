import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Handshake, MessageSquare, Briefcase, Shield } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { markOnboardingComplete } from "@/utils/onboardingHelper";

const slides = [
  {
    icon: Handshake,
    title: "Welcome to Fayvrs",
    subtitle: "No platform fees. Verified community.",
    description: "Connect directly with local service providers and get things done without the middleman.",
  },
  {
    icon: MessageSquare,
    title: "Need Something Done?",
    subtitle: "Post your request for free",
    description: "Get responses from verified local providers within 72 hours. No platform fees, ever.",
  },
  {
    icon: Briefcase,
    title: "Grow Your Business",
    subtitle: "For service providers",
    description: "Get verified, receive qualified leads, and connect directly with customers in your area.",
  },
  {
    icon: Shield,
    title: "Verified & Secure",
    subtitle: "Trust and safety first",
    description: "All providers are identity-verified. In-app messaging keeps your communication safe and secure.",
  },
];

export default function Onboarding() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const handleCarouselChange = (carouselApi: CarouselApi) => {
    if (!carouselApi) return;
    setApi(carouselApi);
    setCurrent(carouselApi.selectedScrollSnap());
    
    carouselApi.on("select", () => {
      setCurrent(carouselApi.selectedScrollSnap());
    });
  };

  const handleSkip = () => {
    markOnboardingComplete();
    navigate("/auth");
  };

  const handleNext = () => {
    if (api) {
      api.scrollNext();
    }
  };

  const handleGetStarted = () => {
    markOnboardingComplete();
    navigate("/auth");
  };

  const handleContinueAsGuest = () => {
    markOnboardingComplete();
    navigate("/");
  };

  const isLastSlide = current === slides.length - 1;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {/* Skip Button - Fixed to viewport */}
      {!isLastSlide && (
        <Button
          variant="ghost"
          onClick={handleSkip}
          className="fixed top-4 right-4 z-50 text-muted-foreground hover:text-foreground"
        >
          Skip
        </Button>
      )}

      <div className="w-full max-w-md">
        <Carousel
          setApi={handleCarouselChange}
          opts={{
            loop: false,
            align: "center",
          }}
          className="w-full"
        >
          <CarouselContent>
            {slides.map((slide, index) => {
              const Icon = slide.icon;
              return (
                <CarouselItem key={index}>
                  <div className="flex flex-col items-center text-center space-y-8 py-12 px-4">
                    {/* Icon */}
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg animate-scale-in">
                      <Icon className="w-12 h-12 text-primary-foreground" strokeWidth={2.5} />
                    </div>

                    {/* Title & Subtitle */}
                    <div className="space-y-3 animate-fade-in">
                      <h1 className="text-3xl font-bold text-foreground">
                        {slide.title}
                      </h1>
                      <p className="text-primary font-semibold text-lg">
                        {slide.subtitle}
                      </p>
                      <p className="text-muted-foreground text-base leading-relaxed max-w-sm mx-auto">
                        {slide.description}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          {/* Navigation Arrows - Hidden on mobile for touch gestures */}
          <div className="hidden md:block">
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </div>
        </Carousel>

        {/* Dot Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === index
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* CTA Buttons - Only on last slide */}
        {isLastSlide ? (
          <div className="space-y-3 pt-12 animate-fade-in">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="w-full h-14 text-base font-semibold rounded-2xl shadow-lg"
            >
              Sign Up or Log In
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleContinueAsGuest}
              className="w-full h-14 text-base font-semibold rounded-2xl border-2"
            >
              Continue as Guest
            </Button>
          </div>
        ) : (
          <div className="pt-12">
            <Button
              size="lg"
              onClick={handleNext}
              className="w-full h-14 text-base font-semibold rounded-2xl shadow-lg"
            >
              Next
            </Button>
          </div>
        )}

        {/* Version */}
        <div className="pt-12 text-center text-xs text-muted-foreground">
          v1.0
        </div>
      </div>
    </div>
  );
}
